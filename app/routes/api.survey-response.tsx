import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { recordSurveyResponseFromBody } from "../lib/survey/survey-response.server";
import {
  submitBodyToContext,
  type SurveyResponseSubmitBody,
} from "../lib/survey/submit-body-to-context";
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

  const shop = shopFromSessionDest(sessionToken.dest);
  if (!shop) {
    return cors(
      Response.json({ ok: false, error: "Invalid session" }, { status: 401 }),
    );
  }

  let body: SurveyResponseSubmitBody;
  try {
    body = (await request.json()) as SurveyResponseSubmitBody;
  } catch {
    return cors(
      Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 }),
    );
  }

  const orderId = body.orderId?.trim();
  const surveyId = body.surveyId?.trim();
  const surveyName = body.surveyName?.trim() ?? "Survey";

  if (!orderId || !surveyId) {
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
      surveyId,
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
