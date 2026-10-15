export {
  ACCEPTED_IMAGE_EXTENSIONS,
  assertAcceptedSurveyImageFile,
} from "./image-file-types";

/** @deprecated Survey images upload to Shopify Files; kept for legacy callers. */
export async function readImageAsDataUrl(file: File): Promise<string> {
  const { assertAcceptedSurveyImageFile } = await import("./image-file-types");
  assertAcceptedSurveyImageFile(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
