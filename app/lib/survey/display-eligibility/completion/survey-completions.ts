/** App-owned customer metafield for once-per-customer display recurrence (not full responses). */
export const SURVEY_COMPLETIONS_NAMESPACE = "$app";
export const SURVEY_COMPLETIONS_KEY = "survey_completions";

export interface SurveyCompletionEntry {
  completedAt: string;
  orderId: string;
}

export type SurveyCompletionsMap = Record<string, SurveyCompletionEntry>;

/**
 * Merges one survey completion into the customer JSON map (read-modify-write).
 */
export function mergeSurveyCompletion(
  existing: SurveyCompletionsMap | null | undefined,
  surveyUuid: string,
  orderId: string,
  completedAt: string = new Date().toISOString(),
): SurveyCompletionsMap {
  const id = surveyUuid.trim();
  const order = orderId.trim();
  if (!id || !order) {
    return { ...(existing ?? {}) };
  }
  return {
    ...(existing ?? {}),
    [id]: { completedAt, orderId: order },
  };
}

export function surveyCompletedInMap(
  map: SurveyCompletionsMap | null | undefined,
  surveyUuid: string,
): boolean {
  const id = surveyUuid.trim();
  if (!id || !map || typeof map !== "object") {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(map, id);
}

export function parseSurveyCompletionsMetafield(
  raw: string | null | undefined,
): SurveyCompletionsMap {
  if (!raw || typeof raw !== "string") {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as SurveyCompletionsMap;
  } catch {
    return {};
  }
}
