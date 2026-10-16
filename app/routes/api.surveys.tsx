import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { adminApiReadContext } from "../lib/survey/admin-api/admin-read-auth.server";
import { createSurveyForShop } from "../lib/survey/admin-api/mutations.server";
import { listSurveyListItemsForShop } from "../lib/survey/admin-api/survey-list.server";
import { ADMIN_SURVEY_MUTATION_LIMIT } from "../lib/security/rate-limit-config.server";
import { checkRateLimit } from "../lib/security/rate-limit.server";
import { rateLimitExceededResponse } from "../lib/security/rate-limit-response.server";
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";

/**
 * Admin survey collection: `GET` list summaries, `POST` creates a blank survey.
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

  try {
    const data = await listSurveyListItemsForShop(ctx.shop);
    return Response.json({ ok: true, data });
  } catch (error) {
    console.error("listSurveyListItemsForShop", error);
    return Response.json(
      { ok: false, error: "Could not load surveys" },
      { status: 500 },
    );
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);

  if (request.method !== "POST") {
    return Response.json(
      { ok: false, error: "Method not allowed" },
      { status: 405 },
    );
  }

  const limit = checkRateLimit(
    `admin-survey-mutation:${session.shop}`,
    ADMIN_SURVEY_MUTATION_LIMIT,
  );
  if (!limit.allowed) {
    return rateLimitExceededResponse(limit);
  }

  try {
    const { surveyId } = await createSurveyForShop(shop);
    return Response.json({ ok: true, surveyId });
  } catch (error) {
    console.error("createSurveyForShop", error);
    return Response.json(
      { ok: false, error: "Could not create survey" },
      { status: 500 },
    );
  }
};
