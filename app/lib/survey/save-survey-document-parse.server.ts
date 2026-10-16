import type { SurveyDocument } from "./types";

/** Invalid survey save payload (maps to 400). */
export class SurveySaveBodyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SurveySaveBodyError";
  }
}

/**
 * Parses admin PUT body: competitor-shaped `{ data: SurveyDocument }` or bare document.
 */
export function parseSurveySaveRequestBody(raw: unknown): SurveyDocument {
  let candidate: unknown = raw;
  if (raw && typeof raw === "object" && "data" in raw) {
    candidate = (raw as { data: unknown }).data;
  }

  if (!candidate || typeof candidate !== "object") {
    throw new SurveySaveBodyError("Invalid survey payload");
  }

  const survey = candidate as SurveyDocument;
  if (!survey.id?.trim()) {
    throw new SurveySaveBodyError("Survey id is required");
  }
  if (!survey.name?.trim()) {
    throw new SurveySaveBodyError("Survey name is required");
  }

  return survey;
}
