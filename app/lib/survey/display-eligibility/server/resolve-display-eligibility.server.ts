import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { unauthenticated } from "../../../../shopify.server";
import {
  CHECKOUT_SURVEYS_CHANNEL_KEYS,
  type CheckoutSurveysChannelKey,
} from "../../runtime-channels";
import { resolvePostPurchasePageDisplayEligibility } from "../channels/post-purchase-page.server";
import type {
  ResolveSurveyDisplayEligibilityInput,
  SurveyDisplayEligibilityResult,
} from "../types";

function isCheckoutSurveysChannelKey(
  value: string,
): value is CheckoutSurveysChannelKey {
  return (CHECKOUT_SURVEYS_CHANNEL_KEYS as readonly string[]).includes(value);
}

/**
 * Dispatches survey display eligibility to the channel-specific resolver.
 * Add a case when a new channel ships its own rules (email, on-site widget, etc.).
 */
export async function resolveSurveyDisplayEligibility(
  input: ResolveSurveyDisplayEligibilityInput,
): Promise<SurveyDisplayEligibilityResult> {
  const surveyUuid = input.surveyUuid.trim();
  const channelKey = input.channelKey.trim();
  if (!surveyUuid || !channelKey) {
    return { show: false };
  }

  if (!isCheckoutSurveysChannelKey(channelKey)) {
    console.warn(
      `survey-display-eligibility: unsupported channelKey "${channelKey}"`,
    );
    return { show: false };
  }

  let admin: AdminApiContext;
  try {
    const session = await unauthenticated.admin(input.shop.myshopifyDomain);
    admin = session.admin;
  } catch (error) {
    console.warn("survey-display-eligibility: admin session unavailable", error);
    return { show: false };
  }

  switch (channelKey) {
    case "postPurchasePage":
      return resolvePostPurchasePageDisplayEligibility(admin, {
        ...input,
        channelKey,
      });
    default: {
      const _exhaustive: never = channelKey;
      return _exhaustive;
    }
  }
}
