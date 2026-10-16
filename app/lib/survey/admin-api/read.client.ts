import { adminApiFetch } from "../../admin-api/fetch.client";
import type { SurveyDocument } from "../types";
import type { SurveyListItem } from "./survey-list.server";
import type { ResponseListApiItem } from "../response/response-list-api.server";

interface OkBody<T> {
  ok?: boolean;
  data?: T;
  error?: string;
  pagination?: { skip: number; take: number; total: number };
}

async function parseOkData<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as OkBody<T>;
  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error || "Request failed");
  }
  return payload.data;
}

/** `GET /api/surveys/:uuid` — full survey document (competitor-shaped `{ data }`). */
export async function fetchSurveyDocumentViaApi(
  surveyId: string,
  sessionToken: string,
): Promise<SurveyDocument> {
  const response = await adminApiFetch(
    `/api/surveys/${encodeURIComponent(surveyId)}`,
    sessionToken,
    { method: "GET" },
  );
  return parseOkData<SurveyDocument>(response);
}

/** `GET /api/surveys` — list summary rows. */
export async function fetchSurveyListViaApi(
  sessionToken: string,
): Promise<SurveyListItem[]> {
  const response = await adminApiFetch("/api/surveys", sessionToken, {
    method: "GET",
  });
  return parseOkData<SurveyListItem[]>(response);
}

export interface ResponsesPageResult {
  items: ResponseListApiItem[];
  pagination: { skip: number; take: number; total: number };
}

/** `GET /api/responses?skip=&take=` */
export async function fetchResponsesPageViaApi(
  sessionToken: string,
  skip = 0,
  take = 50,
): Promise<ResponsesPageResult> {
  const params = new URLSearchParams({
    skip: String(skip),
    take: String(take),
  });
  const response = await adminApiFetch(
    `/api/responses?${params.toString()}`,
    sessionToken,
    { method: "GET" },
  );
  const payload = (await response.json().catch(() => ({}))) as OkBody<
    ResponseListApiItem[]
  >;
  if (!response.ok || !payload.ok || !payload.data || !payload.pagination) {
    throw new Error(payload.error || "Request failed");
  }
  return { items: payload.data, pagination: payload.pagination };
}
