import type { SurveyDocument } from "./types";

export interface SaveSurveyDocumentResult {
  ok: boolean;
  publishedToShopify?: boolean;
  error?: string;
}

interface SaveResponseBody {
  ok?: boolean;
  publishedToShopify?: boolean;
  error?: string;
}

/**
 * Persists the survey via `PUT /api/surveys/:id` with competitor-shaped `{ data }` body.
 */
export async function saveSurveyDocument(
  survey: SurveyDocument,
  sessionToken: string,
): Promise<SaveSurveyDocumentResult> {
  const id = survey.id?.trim();
  if (!id) {
    return { ok: false, error: "Survey id is required" };
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionToken}`,
  };

  const response = await fetch(`/api/surveys/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: survey }),
    credentials: "include",
  });

  const payload = (await response.json().catch(() => ({}))) as SaveResponseBody;
  if (!response.ok || !payload.ok) {
    return {
      ok: false,
      error: payload.error || "Could not save survey",
    };
  }

  return {
    ok: true,
    publishedToShopify: payload.publishedToShopify,
  };
}
