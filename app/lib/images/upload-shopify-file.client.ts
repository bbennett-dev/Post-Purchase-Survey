import {
  assertAcceptedSurveyImageFile,
  mimeTypeQueryParam,
} from "./image-file-types";

export interface ShopifyFileUploadResult {
  altText: string;
  mimeType: string;
  title: string;
  url: string;
  shopifyFileId: string;
}

interface UploadResponseBody {
  success: boolean;
  data?: ShopifyFileUploadResult;
  error?: string;
}

/**
 * Uploads an image to `/api/shopify/file` (stored in shop Files → CDN URL).
 */
export async function uploadShopifyFile(
  file: File,
  sessionToken?: string,
): Promise<ShopifyFileUploadResult> {
  assertAcceptedSurveyImageFile(file);

  const fileName = file.name || `upload-${Date.now()}`;
  const mimeType = mimeTypeQueryParam(file);
  const params = new URLSearchParams({
    fileName,
    mimeType,
  });

  const body = new FormData();
  body.append("file", file);

  const headers: HeadersInit = {};
  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  const response = await fetch(`/api/shopify/file?${params.toString()}`, {
    method: "POST",
    headers,
    body,
    credentials: "include",
  });

  const payload = (await response.json().catch(() => ({}))) as UploadResponseBody;
  if (!response.ok || !payload.success || !payload.data?.url) {
    throw new Error(payload.error || "Image upload failed");
  }

  return payload.data;
}
