import type { ShopRecord } from "../../shop/shop.server";
import type { CheckoutSurveysChannelKey } from "../runtime-channels";

export type BuyerLifecycle = "new" | "return" | "unknown";

export interface BuyerSegmentInput {
  lifecycle: BuyerLifecycle;
  customerTags?: string[];
}

export interface SurveyDisplayEligibilityResult {
  show: boolean;
}

/**
 * Context passed from any channel runtime (checkout extension, theme, email link, etc.).
 */
export interface SurveyDisplayEligibilityContext {
  orderId?: string | null;
  customerId?: string | null;
  email?: string | null;
  isFirstOrder?: boolean | null;
}

export interface ResolveSurveyDisplayEligibilityInput
  extends SurveyDisplayEligibilityContext {
  shop: ShopRecord;
  surveyUuid: string;
  /** Matches `survey.channels` key (e.g. postPurchasePage). */
  channelKey: CheckoutSurveysChannelKey | string;
}
