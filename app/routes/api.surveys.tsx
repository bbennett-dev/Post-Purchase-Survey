import type { ActionFunctionArgs } from "react-router";
import { createSurveyForShop } from "../lib/survey/survey-admin-mutations.server";
import { ADMIN_SURVEY_MUTATION_LIMIT } from "../lib/security/rate-limit-config.server";
import { checkRateLimit } from "../lib/security/rate-limit.server";
import { rateLimitExceededResponse } from "../lib/security/rate-limit-response.server";
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";

/**
 * Admin survey collection: `POST` creates a blank survey (embedded list "Create").
 */
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
