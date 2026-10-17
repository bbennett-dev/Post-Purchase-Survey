import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { isShopifyOrderGid } from "../../response/submission-context-merge";
import type { PostPurchasePageChannel } from "../../types";
import {
  customerGidFromId,
  customerHasSurveyCompletion,
  findCustomerGidByEmail,
} from "../completion/survey-completions.server";
import { lifecycleFromIsFirstOrder } from "../rules/buyer-lifecycle";
import { passesUserSegmentTargeting } from "../rules/segment-targeting";
import {
  passesWidgetRecurrence,
  widgetRecurrenceMode,
} from "../rules/widget-recurrence";
import { loadBuyerFromOrder } from "../server/buyer-from-order.server";
import {
  loadPublishedSurveyFromShopMetafield,
  publishedChannelFromPayload,
} from "../server/published-survey.server";
import type {
  ResolveSurveyDisplayEligibilityInput,
  SurveyDisplayEligibilityResult,
} from "../types";

async function resolveCustomerGid(
  admin: AdminApiContext,
  customerId: string | null,
  email: string | null,
): Promise<string | null> {
  const fromId = customerGidFromId(customerId);
  if (fromId) {
    return fromId;
  }
  if (email?.trim()) {
    return findCustomerGidByEmail(admin, email);
  }
  return null;
}

/**
 * Thank-you / order-status channel: segment targeting, order buyer lookup, customer metafield recurrence.
 */
export async function resolvePostPurchasePageDisplayEligibility(
  admin: AdminApiContext,
  input: ResolveSurveyDisplayEligibilityInput,
): Promise<SurveyDisplayEligibilityResult> {
  const surveyUuid = input.surveyUuid.trim();
  if (!surveyUuid) {
    return { show: false };
  }

  const published = await loadPublishedSurveyFromShopMetafield(admin, surveyUuid);
  const channel = publishedChannelFromPayload<PostPurchasePageChannel>(
    published,
    "postPurchasePage",
  );
  if (!channel) {
    return { show: false };
  }

  let lifecycle = lifecycleFromIsFirstOrder(input.isFirstOrder);
  let customerTags: string[] = [];
  let customerId = input.customerId?.trim() || null;
  const email = input.email?.trim() || null;
  let customerGid: string | null = customerGidFromId(customerId);

  const orderId = input.orderId?.trim() || null;
  const needsOrderLookup =
    (lifecycle === "unknown" ||
      (channel.userTargeting?.customerSegment?.length ?? 0) > 0) &&
    orderId &&
    isShopifyOrderGid(orderId);

  if (needsOrderLookup) {
    const fromOrder = await loadBuyerFromOrder(admin, orderId);
    if (lifecycle === "unknown") {
      lifecycle = fromOrder.lifecycle;
    }
    if (fromOrder.customerTags.length) {
      customerTags = fromOrder.customerTags;
    }
    customerId = customerId ?? fromOrder.customerId;
    customerGid = customerGid ?? fromOrder.customerGid;
  }

  if (!passesUserSegmentTargeting(channel, { lifecycle, customerTags })) {
    return { show: false };
  }

  if (widgetRecurrenceMode(channel) === "every_order") {
    return { show: true };
  }

  if (!customerGid) {
    customerGid = await resolveCustomerGid(admin, customerId, email);
  }
  if (!customerGid) {
    return { show: true };
  }

  const hasPrior = await customerHasSurveyCompletion(
    admin,
    customerGid,
    surveyUuid,
  );
  return { show: passesWidgetRecurrence(channel, hasPrior) };
}
