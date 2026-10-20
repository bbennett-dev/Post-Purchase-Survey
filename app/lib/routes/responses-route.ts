import type { listResponsesForAdminApi } from "../survey/response/response-list-api.server";

export type ResponseView = "active" | "archived";

export type ResponseArchiveToastIntent = "archive" | "unarchive";

export type ResponsesLocationState = {
  responseArchiveToast?: ResponseArchiveToastIntent;
};

/** List URL after archive/unarchive from the detail page. */
export function responsesListAfterArchiveIntent(
  intent: ResponseArchiveToastIntent,
  survey?: string | null,
): string {
  return responsesHref({
    view: intent === "archive" ? "active" : "archived",
    survey,
  });
}

export type ResponsesRouteLoaderData = {
  responses: Awaited<ReturnType<typeof listResponsesForAdminApi>>["items"];
  total: number;
  surveyFilter: string | null;
  view: ResponseView;
};

/** App-owned query params for `/app/responses` (never copy embedded `hmac`, `id_token`, etc.). */
export function responsesHref(options: {
  view?: ResponseView;
  survey?: string | null;
}): string {
  const params = new URLSearchParams();
  const survey = options.survey?.trim();
  if (survey) {
    params.set("survey", survey);
  }
  if (options.view === "archived") {
    params.set("view", "archived");
  }
  const query = params.toString();
  return query ? `/app/responses?${query}` : "/app/responses";
}

export function responseDetailHref(
  responseId: string,
  options?: { view?: ResponseView; survey?: string | null },
): string {
  const base = `/app/responses/${encodeURIComponent(responseId)}`;
  const params = new URLSearchParams();
  const survey = options?.survey?.trim();
  if (survey) {
    params.set("survey", survey);
  }
  if (options?.view === "archived") {
    params.set("view", "archived");
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function parseResponsesRouteSearch(searchParams: URLSearchParams): {
  view: ResponseView;
  survey: string | null;
} {
  return {
    view:
      searchParams.get("view") === "archived" ? "archived" : "active",
    survey: searchParams.get("survey")?.trim() || null,
  };
}
