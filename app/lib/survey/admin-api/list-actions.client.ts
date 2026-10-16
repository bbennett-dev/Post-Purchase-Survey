import { adminApiFetch } from "../../admin-api/fetch.client";

export type SurveyMutationIntent = "duplicate" | "toggle-status";

export interface SurveyAdminApiResult {
  ok: boolean;
  error?: string;
  surveyId?: string;
}

interface ApiJsonBody {
  ok?: boolean;
  error?: string;
  surveyId?: string;
}

async function parseApiResult(response: Response): Promise<SurveyAdminApiResult> {
  const payload = (await response.json().catch(() => ({}))) as ApiJsonBody;
  if (!response.ok || !payload.ok) {
    return {
      ok: false,
      error: payload.error || "Request failed",
    };
  }
  return {
    ok: true,
    surveyId: payload.surveyId,
  };
}

/** Creates a blank survey for the shop. */
export async function createSurveyViaApi(
  sessionToken: string,
): Promise<SurveyAdminApiResult> {
  const response = await adminApiFetch("/api/surveys", sessionToken, {
    method: "POST",
    body: {},
  });
  return parseApiResult(response);
}

/** Duplicate or toggle live/paused for one survey. */
export async function surveyMutationViaApi(
  surveyId: string,
  intent: SurveyMutationIntent,
  sessionToken: string,
): Promise<SurveyAdminApiResult> {
  const response = await adminApiFetch(
    `/api/surveys/${encodeURIComponent(surveyId)}`,
    sessionToken,
    { method: "POST", body: { intent } },
  );
  return parseApiResult(response);
}

/** Deletes a survey and syncs Shopify metafields. */
export async function deleteSurveyViaApi(
  surveyId: string,
  sessionToken: string,
): Promise<SurveyAdminApiResult> {
  const response = await adminApiFetch(
    `/api/surveys/${encodeURIComponent(surveyId)}`,
    sessionToken,
    { method: "DELETE" },
  );
  return parseApiResult(response);
}
