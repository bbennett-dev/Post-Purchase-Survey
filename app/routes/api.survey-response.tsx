import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { recordSurveyResponseFromBody } from "../lib/survey/response/survey-response.server";
import {
  submitBodyToContext,
  type SurveyResponseSubmitBody,
} from "../lib/survey/response/submit-body-to-context";
import { getOrCreateShopByDomain } from "../lib/shop/shop.server";
import {
  SURVEY_RESPONSE_MAX_BODY_BYTES,
  SURVEY_RESPONSE_POST_LIMIT,
  SURVEY_RESPONSE_PREFLIGHT_LIMIT,
} from "../lib/security/rate-limit-config.server";
import {
  checkRateLimit,
  clientIpFromRequest,
} from "../lib/security/rate-limit.server";
import { rateLimitExceededResponse } from "../lib/security/rate-limit-response.server";
import {
  readJsonBodyWithLimit,
  RequestBodyTooLargeError,
} from "../lib/security/request-body.server";
import { authenticate } from "../shopify.server";

function shopFromSessionDest(dest: unknown): string | null {
  if (typeof dest !== "string" || dest.trim().length === 0) {
    return null;
  }
  try {
    const url = dest.startsWith("http") ? new URL(dest) : null;
    const host = url ? url.host : dest.replace(/^https?:\/\//, "").split("/")[0];
    return host && host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

/**
 * CORS preflight for checkout UI extension submit requests.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const preflightKey = `survey-preflight:${clientIpFromRequest(request)}`;
  const preflightLimit = checkRateLimit(
    preflightKey,
    SURVEY_RESPONSE_PREFLIGHT_LIMIT,
  );
  if (!preflightLimit.allowed) {
    return rateLimitExceededResponse(preflightLimit);
  }

  const { cors } = await authenticate.public.checkout(request);
  return cors(new Response(null, { status: 204 }));
};

/**
 * Authenticated checkout extension endpoint: records all question answers per order.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { sessionToken, cors } = await authenticate.public.checkout(request);

  if (request.method !== "POST") {
    return cors(
      Response.json({ ok: false, error: "Method not allowed" }, { status: 405 }),
    );
  }

  const domain = shopFromSessionDest(sessionToken.dest);
  if (!domain) {
    return cors(
      Response.json({ ok: false, error: "Invalid session" }, { status: 401 }),
    );
  }

  const postLimit = checkRateLimit(
    `survey-post:${domain}`,
    SURVEY_RESPONSE_POST_LIMIT,
  );
  if (!postLimit.allowed) {
    return cors(rateLimitExceededResponse(postLimit));
  }

  const shop = await getOrCreateShopByDomain(domain);

  let body: SurveyResponseSubmitBody;
  try {
    body = await readJsonBodyWithLimit<SurveyResponseSubmitBody>(
      request,
      SURVEY_RESPONSE_MAX_BODY_BYTES,
    );
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return cors(
        Response.json({ ok: false, error: "Payload too large" }, { status: 413 }),
      );
    }
    return cors(
      Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 }),
    );
  }

  const orderId = body.orderId?.trim();
  const surveyUuid = body.surveyId?.trim();
  const surveyName = body.surveyName?.trim() ?? "Survey";

  if (!orderId || !surveyUuid) {
    return cors(
      Response.json(
        { ok: false, error: "Missing order or survey" },
        { status: 400 },
      ),
    );
  }

  const customerId = body.customerId?.trim() || null;
  const context = submitBodyToContext(body);

  try {
    await recordSurveyResponseFromBody({
      shop,
      orderId,
      surveyUuid,
      surveyName,
      customerId,
      answers: body.answers,
      answerId: body.answerId?.trim(),
      answerLabel: body.answerLabel?.trim(),
      customText: body.customText,
      context,
      rawPayload: body,
    });
  } catch (error) {
    console.error("recordSurveyResponse", error);
    const message =
      error instanceof Error && error.message === "Survey not found"
        ? "Survey not found"
        : error instanceof Error &&
            error.message === "Invalid answers payload"
          ? "Missing or invalid answers"
          : "Could not save response";
    const status =
      message === "Could not save response" ? 500 : 400;
    return cors(Response.json({ ok: false, error: message }, { status }));
  }

  return cors(Response.json({ ok: true }));
};
