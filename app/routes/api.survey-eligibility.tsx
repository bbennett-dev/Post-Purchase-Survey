import type { LoaderFunctionArgs } from "react-router";
import { resolveSurveyDisplayEligibility } from "../lib/survey/display-eligibility/server/resolve-display-eligibility.server";
import { CHECKOUT_SURVEYS_CHANNEL_KEYS } from "../lib/survey/runtime-channels";
import { getOrCreateShopByDomain } from "../lib/shop/shop.server";
import {
  SURVEY_RESPONSE_PREFLIGHT_LIMIT,
} from "../lib/security/rate-limit-config.server";
import {
  checkRateLimit,
  clientIpFromRequest,
} from "../lib/security/rate-limit.server";
import { rateLimitExceededResponse } from "../lib/security/rate-limit-response.server";
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

function parseIsFirstOrder(value: string | null): boolean | null {
  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }
  return null;
}

/**
 * Survey display eligibility for checkout (and future channel runtimes).
 * Dispatches by `channelKey`; uses Shopify Admin GraphQL only — no Prisma on this route.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const preflightKey = `survey-eligibility:${clientIpFromRequest(request)}`;
  const preflightLimit = checkRateLimit(
    preflightKey,
    SURVEY_RESPONSE_PREFLIGHT_LIMIT,
  );
  if (!preflightLimit.allowed) {
    return rateLimitExceededResponse(preflightLimit);
  }

  const { sessionToken, cors } = await authenticate.public.checkout(request);
  const domain = shopFromSessionDest(sessionToken.dest);
  if (!domain) {
    return cors(
      Response.json({ show: false, error: "Invalid session" }, { status: 401 }),
    );
  }

  const url = new URL(request.url);
  const surveyUuid = url.searchParams.get("surveyId")?.trim() ?? "";
  if (!surveyUuid) {
    return cors(
      Response.json({ show: false, error: "Missing surveyId" }, { status: 400 }),
    );
  }

  const channelKey =
    url.searchParams.get("channelKey")?.trim() ||
    url.searchParams.get("channel")?.trim() ||
    CHECKOUT_SURVEYS_CHANNEL_KEYS[0];

  const shop = await getOrCreateShopByDomain(domain);
  const result = await resolveSurveyDisplayEligibility({
    shop,
    surveyUuid,
    channelKey,
    orderId: url.searchParams.get("orderId"),
    customerId: url.searchParams.get("customerId"),
    email: url.searchParams.get("email"),
    isFirstOrder: parseIsFirstOrder(url.searchParams.get("isFirstOrder")),
  });

  return cors(Response.json(result));
};
