const ACCEPTED_IMAGE_TYPES = [
  "image/svg+xml",
  "image/jpeg",
  "image/png",
  "image/jpg",
] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = ".svg,.jpg,.jpeg,.png";

/** Reads a local image file as a data URL for editor preview (publish may replace with CDN URL later). */
export async function readImageAsDataUrl(file: File): Promise<string> {
  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    throw new Error("Unsupported file type");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
