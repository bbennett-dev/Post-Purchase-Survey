import type { LoaderFunctionArgs } from "react-router";
import { adminApiReadContext } from "../lib/survey/admin-api/admin-read-auth.server";
import {
  listResponsesForAdminApi,
  parseResponsesPagination,
} from "../lib/survey/response/response-list-api.server";

/**
 * Paginated survey responses for embedded admin (`GET ?skip=&take=`).
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method !== "GET") {
    return Response.json(
      { ok: false, error: "Method not allowed" },
      { status: 405 },
    );
  }

  const ctx = await adminApiReadContext(request);
  if (ctx instanceof Response) {
    return ctx;
  }

  const url = new URL(request.url);
  const pagination = parseResponsesPagination(url.searchParams);
  if ("error" in pagination) {
    return Response.json({ ok: false, error: pagination.error }, { status: 400 });
  }

  try {
    const result = await listResponsesForAdminApi(
      ctx.shop,
      pagination.skip,
      pagination.take,
    );
    return Response.json({
      ok: true,
      data: result.items,
      pagination: {
        skip: result.skip,
        take: result.take,
        total: result.total,
      },
    });
  } catch (error) {
    console.error("listResponsesForAdminApi", error);
    return Response.json(
      { ok: false, error: "Could not load responses" },
      { status: 500 },
    );
  }
};
