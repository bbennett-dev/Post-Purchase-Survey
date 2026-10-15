import type { ActionFunctionArgs } from "react-router";
import { uploadImageToShopifyFiles } from "../lib/shopify/upload-shop-file.server";
import {
  ACCEPTED_IMAGE_TYPES,
  resolveImageMimeType,
} from "../lib/images/image-file-types";
import { authenticate } from "../shopify.server";

const MAX_BYTES = 20 * 1024 * 1024;

/**
 * Upload survey images to the merchant's Shopify Files (Content → Files).
 * Competitor-shaped: `POST /api/shopify/file?fileName=…&mimeType=jpeg` + multipart `file`.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" },
      { status: 405 },
    );
  }

  const url = new URL(request.url);
  const queryFileName = url.searchParams.get("fileName")?.trim() ?? "";
  const queryMime = url.searchParams.get("mimeType");

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { success: false, error: "Invalid form data" },
      { status: 400 },
    );
  }

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return Response.json(
      { success: false, error: "Missing file" },
      { status: 400 },
    );
  }

  const mimeType = resolveImageMimeType(fileEntry.type, queryMime);
  if (!ACCEPTED_IMAGE_TYPES.has(mimeType)) {
    return Response.json(
      { success: false, error: "Unsupported file type" },
      { status: 400 },
    );
  }

  if (fileEntry.size > MAX_BYTES) {
    return Response.json(
      { success: false, error: "File is too large (max 20MB)" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await fileEntry.arrayBuffer());
  const originalFileName =
    queryFileName || fileEntry.name || `upload.${mimeType.split("/")[1]}`;

  try {
    const data = await uploadImageToShopifyFiles(admin, {
      buffer,
      originalFileName,
      mimeType,
    });
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("uploadImageToShopifyFiles", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
};
