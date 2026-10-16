import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { adminApiReadContext } from "../lib/survey/admin-api/admin-read-auth.server";
import { getSurveyDocumentForShop } from "../lib/survey/survey-store.server";
import { PublishSurveyError } from "../lib/survey/publish-shopify.server";
import {
  deleteSurveyMutationForShop,
  parseSurveyMutationIntent,
  runSurveyMutationForShop,
  SurveyMutationError,
} from "../lib/survey/admin-api/mutations.server";
import {
  parseSurveySaveRequestBody,
  saveSurveyDocumentForShop,
  SurveySaveBodyError,
} from "../lib/survey/admin-api/save-document.server";
import {
  ADMIN_SURVEY_MUTATION_LIMIT,
  ADMIN_SURVEY_MUTATION_MAX_BODY_BYTES,
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

function mutationRateLimit(shop: string) {
  return checkRateLimit(
    `admin-survey-mutation:${shop}`,
    ADMIN_SURVEY_MUTATION_LIMIT,
  );
}

/**
 * Admin survey by id: `GET` document, `PUT` save, `POST` duplicate/toggle, `DELETE` remove.
 */
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (request.method !== "GET") {
    return Response.json(
      { ok: false, error: "Method not allowed" },
      { status: 405 },
    );
  }

  const surveyUuid = params.surveyUuid?.trim();
  if (!surveyUuid) {
    return Response.json({ ok: false, error: "Missing survey id" }, { status: 400 });
  }

  const ctx = await adminApiReadContext(request);
  if (ctx instanceof Response) {
    return ctx;
  }

  const document = await getSurveyDocumentForShop(ctx.shop, surveyUuid);
  if (!document) {
    return Response.json({ ok: false, error: "Survey not found" }, { status: 404 });
  }

  return Response.json({ ok: true, data: document });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);

  const surveyUuid = params.surveyUuid?.trim();
  if (!surveyUuid) {
    return Response.json({ ok: false, error: "Missing survey id" }, { status: 400 });
  }

  const method = request.method;

  if (method === "DELETE") {
    const limit = mutationRateLimit(session.shop);
    if (!limit.allowed) {
      return rateLimitExceededResponse(limit);
    }
    try {
      await deleteSurveyMutationForShop(admin, shop, surveyUuid);
      return Response.json({ ok: true });
    } catch (error) {
      if (error instanceof SurveyMutationError) {
        return Response.json({ ok: false, error: error.message }, { status: 400 });
      }
      console.error("deleteSurveyMutationForShop", error);
      return Response.json(
        { ok: false, error: "Could not delete survey" },
        { status: 500 },
      );
    }
  }

  if (method === "POST") {
    const limit = mutationRateLimit(session.shop);
    if (!limit.allowed) {
      return rateLimitExceededResponse(limit);
    }
    let raw: unknown;
    try {
      raw = await readJsonBodyWithLimit<unknown>(
        request,
        ADMIN_SURVEY_MUTATION_MAX_BODY_BYTES,
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
      const intent = parseSurveyMutationIntent(raw);
      await runSurveyMutationForShop(admin, shop, surveyUuid, intent);
      return Response.json({ ok: true });
    } catch (error) {
      if (error instanceof SurveyMutationError) {
        return Response.json({ ok: false, error: error.message }, { status: 400 });
      }
      console.error("runSurveyMutationForShop", error);
      return Response.json(
        { ok: false, error: "Action failed" },
        { status: 500 },
      );
    }
  }

  if (method !== "PUT") {
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
