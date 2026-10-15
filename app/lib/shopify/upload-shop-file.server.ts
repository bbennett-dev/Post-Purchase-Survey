import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { randomUUID } from "node:crypto";

export interface ShopifyUploadedFile {
  altText: string;
  mimeType: string;
  title: string;
  url: string;
  shopifyFileId: string;
}

const STAGED_UPLOADS_CREATE = `#graphql
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const FILE_CREATE = `#graphql
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        alt
        fileStatus
        ... on MediaImage {
          image {
            url
          }
        }
        ... on GenericFile {
          url
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const FILE_POLL = `#graphql
  query FilePoll($id: ID!) {
    node(id: $id) {
      ... on MediaImage {
        id
        fileStatus
        image {
          url
        }
      }
      ... on GenericFile {
        id
        fileStatus
        url
      }
    }
  }
`;

function extensionFromMime(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

function mimeLabel(mimeType: string): string {
  const ext = extensionFromMime(mimeType);
  if (ext === "jpg") {
    return "jpeg";
  }
  return ext;
}

function stagedResourceForMime(mimeType: string): "IMAGE" | "FILE" {
  return mimeType === "image/svg+xml" ? "FILE" : "IMAGE";
}

function contentTypeForMime(mimeType: string): "IMAGE" | "FILE" {
  return mimeType === "image/svg+xml" ? "FILE" : "IMAGE";
}

function buildStoredFileName(originalName: string, mimeType: string): string {
  const base = originalName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "_");
  const ext = extensionFromMime(mimeType);
  return `${base || "upload"}_${randomUUID()}.${ext}`;
}

async function graphqlJson<T>(
  admin: AdminApiContext,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await admin.graphql(query, { variables });
  const payload = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message).join("; "));
  }
  if (!payload.data) {
    throw new Error("Empty GraphQL response");
  }
  return payload.data;
}

/**
 * Shopify staged image uploads use PUT + policy headers (not multipart POST).
 * @see https://shopify.dev/docs/apps/build/product-merchandising/products-and-collections/manage-media
 */
async function uploadToStagedTarget(
  target: {
    url: string;
    parameters: { name: string; value: string }[];
  },
  buffer: Buffer,
  mimeType: string,
): Promise<void> {
  const headers = new Headers();
  for (const param of target.parameters) {
    headers.set(param.name, param.value);
  }
  if (!headers.has("content_type") && !headers.has("Content-Type")) {
    headers.set("content_type", mimeType);
  }

  const uploadResponse = await fetch(target.url, {
    method: "PUT",
    headers,
    body: new Uint8Array(buffer),
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text().catch(() => "");
    throw new Error(
      `Staged upload failed (${uploadResponse.status})${text ? `: ${text}` : ""}`,
    );
  }
}

async function pollFileUrl(
  admin: AdminApiContext,
  fileId: string,
): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const data = await graphqlJson<{
      node?: {
        fileStatus?: string;
        image?: { url?: string | null } | null;
        url?: string | null;
      } | null;
    }>(admin, FILE_POLL, { id: fileId });

    const node = data.node;
    const url = node?.image?.url ?? node?.url ?? null;
    if (url && node?.fileStatus === "READY") {
      return url;
    }
    if (url && node?.fileStatus !== "FAILED") {
      return url;
    }
    if (node?.fileStatus === "FAILED") {
      throw new Error("Shopify file processing failed");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Timed out waiting for Shopify file URL");
}

/**
 * Uploads bytes to the shop's Files (CDN) via staged upload + fileCreate.
 * @see https://shopify.dev/docs/apps/build/product-merchandising/products-and-collections/manage-media
 */
export async function uploadImageToShopifyFiles(
  admin: AdminApiContext,
  input: {
    buffer: Buffer;
    originalFileName: string;
    mimeType: string;
    altText?: string;
  },
): Promise<ShopifyUploadedFile> {
  const mimeType = input.mimeType.trim();
  const filename = buildStoredFileName(input.originalFileName, mimeType);
  const resource = stagedResourceForMime(mimeType);

  const stagedData = await graphqlJson<{
    stagedUploadsCreate: {
      stagedTargets: {
        url: string;
        resourceUrl: string;
        parameters: { name: string; value: string }[];
      }[];
      userErrors: { message: string }[];
    };
  }>(admin, STAGED_UPLOADS_CREATE, {
    input: [
      {
        filename,
        mimeType,
        resource,
        httpMethod: "PUT",
        fileSize: String(input.buffer.byteLength),
      },
    ],
  });

  const stagedErrors = stagedData.stagedUploadsCreate.userErrors;
  if (stagedErrors.length > 0) {
    throw new Error(stagedErrors.map((e) => e.message).join("; "));
  }

  const target = stagedData.stagedUploadsCreate.stagedTargets[0];
  if (!target?.resourceUrl) {
    throw new Error("Could not create staged upload target");
  }

  await uploadToStagedTarget(target, input.buffer, mimeType);

  const createData = await graphqlJson<{
    fileCreate: {
      files: {
        id: string;
        alt: string | null;
        fileStatus: string;
        image?: { url?: string | null } | null;
        url?: string | null;
      }[];
      userErrors: { message: string }[];
    };
  }>(admin, FILE_CREATE, {
    files: [
      {
        alt: input.altText?.trim() || "",
        contentType: contentTypeForMime(mimeType),
        originalSource: target.resourceUrl,
      },
    ],
  });

  const createErrors = createData.fileCreate.userErrors;
  if (createErrors.length > 0) {
    throw new Error(createErrors.map((e) => e.message).join("; "));
  }

  const created = createData.fileCreate.files[0];
  if (!created?.id) {
    throw new Error("fileCreate did not return a file id");
  }

  const immediateUrl = created.image?.url ?? created.url ?? null;
  const url =
    immediateUrl && created.fileStatus === "READY"
      ? immediateUrl
      : await pollFileUrl(admin, created.id);

  return {
    altText: created.alt ?? "",
    mimeType: mimeLabel(mimeType),
    title: filename,
    url,
    shopifyFileId: created.id,
  };
}
