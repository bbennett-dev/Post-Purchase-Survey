import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { Outlet, useLoaderData } from "react-router";
import { listResponsesForAdminApi } from "../lib/survey/response/response-list-api.server";
import { setSurveyResponseArchived } from "../lib/survey/response/survey-response.server";
import {
  parseResponsesRouteSearch,
  type ResponsesRouteLoaderData,
} from "../lib/routes/responses-route";

export type { ResponsesRouteLoaderData };
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

const RESPONSES_LIST_TAKE = 200;

/**
 * Shared list loader for index + detail (no fetch-by-id).
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<ResponsesRouteLoaderData> => {
  const { session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);
  const url = new URL(request.url);
  const { view, survey: surveyFilter } = parseResponsesRouteSearch(
    url.searchParams,
  );

  const { items, total } = await listResponsesForAdminApi(
    shop,
    0,
    RESPONSES_LIST_TAKE,
    surveyFilter ?? undefined,
    view === "archived",
  );

  return { responses: items, total, surveyFilter, view };
};

/**
 * Archive / unarchive from list or detail (same list loader revalidates).
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);

  if (request.method !== "POST") {
    return Response.json(
      { ok: false as const, error: "Method not allowed" },
      { status: 405 },
    );
  }

  const form = await request.formData();
  const intent = form.get("intent");
  const responseId = form.get("responseId");

  if (typeof responseId !== "string" || !responseId.trim()) {
    return Response.json(
      { ok: false as const, error: "Invalid request" },
      { status: 400 },
    );
  }

  if (intent !== "archive" && intent !== "unarchive") {
    return Response.json(
      { ok: false as const, error: "Invalid request" },
      { status: 400 },
    );
  }

  const isArchived = intent === "archive";
  const outcome = await setSurveyResponseArchived(
    shop,
    responseId,
    isArchived,
  );
  if (outcome === "not_found") {
    return Response.json(
      { ok: false as const, error: "Response not found" },
      { status: 404 },
    );
  }

  return Response.json({ ok: true as const, intent });
};

/** Parent layout — list loader data shared with index + detail routes. */
export default function ResponsesLayout() {
  const data = useLoaderData<typeof loader>();
  return <Outlet context={data} />;
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
