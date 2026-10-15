export const ACCEPTED_IMAGE_TYPES = new Set([
  "image/svg+xml",
  "image/jpeg",
  "image/png",
  "image/jpg",
]);

export const ACCEPTED_IMAGE_EXTENSIONS = ".svg,.jpg,.jpeg,.png";

const MIME_ALIASES: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
};

/** Validates browser File type for survey image uploads. */
export function assertAcceptedSurveyImageFile(file: File): void {
  const mimeType = resolveImageMimeType(file.type, null);
  if (!ACCEPTED_IMAGE_TYPES.has(mimeType)) {
    throw new Error("Unsupported file type");
  }
}

export function resolveImageMimeType(
  fileType: string,
  queryMime: string | null | undefined,
): string {
  const fromFile = fileType?.trim().toLowerCase();
  if (fromFile && ACCEPTED_IMAGE_TYPES.has(fromFile)) {
    return fromFile === "image/jpg" ? "image/jpeg" : fromFile;
  }
  const alias = queryMime?.trim().toLowerCase() ?? "";
  if (alias && MIME_ALIASES[alias]) {
    return MIME_ALIASES[alias];
  }
  return fromFile;
}

export function mimeTypeQueryParam(file: File): string {
  const mime = resolveImageMimeType(file.type, null);
  if (mime === "image/jpeg") {
    return "jpeg";
  }
  if (mime === "image/png") {
    return "png";
  }
  if (mime === "image/svg+xml") {
    return "svg";
  }
  return "jpeg";
}
