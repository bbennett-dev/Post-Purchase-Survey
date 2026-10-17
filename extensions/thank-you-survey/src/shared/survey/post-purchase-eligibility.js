import { CHECKOUT_CHANNEL_KEY } from "../channel-config.js";
import { postPurchaseChannelFromSurvey } from "./post-purchase-display.js";
import { readBuyerIds } from "./buyer-context.js";

/**
 * Sync eligibility (no app HTTP):
 * - every_order + all_users → always
 * - every_order + segment (return/new only, no tag groups) + known isFirstOrder on thank-you
 *
 * Needs GET /api/survey-eligibility:
 * - once_per_customer (recurrence metafield on Customer)
 * - custom tag groups, order-status lifecycle, unknown isFirstOrder
 */

function lifecycleFromIsFirstOrder(isFirstOrder) {
  if (isFirstOrder === true) {
    return "new";
  }
  if (isFirstOrder === false) {
    return "return";
  }
  return "unknown";
}

function passesSyncUserTargeting(channel, isFirstOrder) {
  const targeting = channel?.userTargeting;
  if (!targeting || targeting.type !== "segment") {
    return true;
  }
  const wantsReturn = targeting.returnCustomer === true;
  const wantsNew = targeting.newCustomer === true;
  const groups = (targeting.customerSegment ?? []).filter(
    (group) => group.enabled !== false,
  );
  if (groups.length > 0) {
    return null;
  }
  if (!wantsReturn && !wantsNew) {
    return false;
  }
  const lifecycle = lifecycleFromIsFirstOrder(isFirstOrder);
  if (lifecycle === "unknown") {
    return null;
  }
  if (lifecycle === "new") {
    return wantsNew;
  }
  return wantsReturn;
}

function canDecideSyncWithoutNetwork(channel, isFirstOrder) {
  if (!channel || channel.enabled === false) {
    return false;
  }
  if (channel.widgetRecurrence !== "every_order") {
    return false;
  }
  const sync = passesSyncUserTargeting(channel, isFirstOrder);
  return sync !== null;
}

async function fetchEligibility({
  eligibilityUrl,
  surveyId,
  orderId,
  customerId,
  email,
  isFirstOrder,
}) {
  const params = new URLSearchParams({
    surveyId,
    channelKey: CHECKOUT_CHANNEL_KEY,
  });
  if (orderId) {
    params.set("orderId", orderId);
  }
  if (customerId) {
    params.set("customerId", customerId);
  }
  if (email) {
    params.set("email", email);
  }
  if (isFirstOrder === true || isFirstOrder === false) {
    params.set("isFirstOrder", String(isFirstOrder));
  }
  const token = await shopify.sessionToken.get();
  const response = await fetch(`${eligibilityUrl}?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return false;
  }
  const body = await response.json().catch(() => ({}));
  return body.show === true;
}

/**
 * Applies post-purchase user targeting + recurrence for checkout surfaces.
 */
export async function resolvePostPurchaseShow({
  survey,
  config,
  surface,
  orderId,
}) {
  const channel = postPurchaseChannelFromSurvey(survey);
  if (!channel || channel.enabled === false) {
    return false;
  }

  const { email, customerId, isFirstOrder } = readBuyerIds(surface);
  const syncTargeting = passesSyncUserTargeting(channel, isFirstOrder);

  if (syncTargeting === false) {
    return false;
  }

  if (canDecideSyncWithoutNetwork(channel, isFirstOrder)) {
    return syncTargeting === true;
  }

  const eligibilityUrl = config?.eligibilityUrl ?? null;
  if (!eligibilityUrl) {
    return syncTargeting === null ? false : syncTargeting;
  }

  return fetchEligibility({
    eligibilityUrl,
    surveyId: survey.id,
    orderId,
    customerId,
    email,
    isFirstOrder,
  });
}

