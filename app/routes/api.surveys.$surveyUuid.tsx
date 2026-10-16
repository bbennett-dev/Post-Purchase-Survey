import type { ActionFunctionArgs } from "react-router";
import { PublishSurveyError } from "../lib/survey/publish-shopify.server";
import {
  parseSurveySaveRequestBody,
  saveSurveyDocumentForShop,
  SurveySaveBodyError,
} from "../lib/survey/save-survey-document.server";
import {
  ADMIN_SURVEY_SAVE_LIMIT,
  ADMIN_SURVEY_SAVE_MAX_BODY_BYTES,
} from "../lib/security/rate-limit-config.server";
import { checkRateLimit } from "../lib/security/rate-limit.server";
import { rateLimitExceededResponse } from "../lib/security/rate-limit-response.server";
import {
  readJsonBodyWithLimit,
  RequestBodyTooLargeError,
} from "../lib/security/request-body.server";
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";

/**
 * Admin survey persist (embedded editor). JSON body `{ data: SurveyDocument }`;
 * session via `authenticate.admin` (cookie + optional Authorization Bearer).
 * Avoids posting saves to `editor.data` with embed query params on the URL.
 */
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);

  const surveyUuid = params.surveyUuid?.trim();
  if (!surveyUuid) {
    return Response.json({ ok: false, error: "Missing survey id" }, { status: 400 });
  }

  if (request.method !== "PUT") {
    return Response.json(
      { ok: false, error: "Method not allowed" },
      { status: 405 },
    );
  }

  const saveLimit = checkRateLimit(
    `admin-survey-save:${session.shop}`,
    ADMIN_SURVEY_SAVE_LIMIT,
  );
  if (!saveLimit.allowed) {
    return rateLimitExceededResponse(saveLimit);
  }

  let raw: unknown;
  try {
    raw = await readJsonBodyWithLimit<unknown>(
      request,
      ADMIN_SURVEY_SAVE_MAX_BODY_BYTES,
    );
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return Response.json(
        { ok: false, error: "Payload too large" },
        { status: 413 },
      );
    }
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const survey = parseSurveySaveRequestBody(raw);
    const { publishedToShopify } = await saveSurveyDocumentForShop(
      admin,
      shop,
      surveyUuid,
      survey,
    );
    return Response.json({ ok: true, publishedToShopify });
  } catch (error) {
    if (error instanceof SurveySaveBodyError) {
      return Response.json({ ok: false, error: error.message }, { status: 400 });
    }
    if (error instanceof PublishSurveyError) {
      return Response.json({ ok: false, error: error.message }, { status: 400 });
    }
    console.error("saveSurveyDocumentForShop", error);
    const message =
      error instanceof Error ? error.message : "Could not save survey";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
};
