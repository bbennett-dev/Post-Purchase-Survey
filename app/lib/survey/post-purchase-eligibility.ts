import type { PostPurchasePageChannel } from "./types";
import {
  lifecycleFromIsFirstOrder,
  lifecycleFromOrderCount,
} from "./display-eligibility/rules/buyer-lifecycle";
import { passesUserSegmentTargeting } from "./display-eligibility/rules/segment-targeting";
import type { BuyerLifecycle } from "./display-eligibility/types";
import {
  passesWidgetRecurrence,
  widgetRecurrenceMode,
} from "./display-eligibility/rules/widget-recurrence";

export type { BuyerLifecycle };

export { lifecycleFromIsFirstOrder, lifecycleFromOrderCount };

export interface PostPurchaseTargetingInput {
  lifecycle: BuyerLifecycle;
  customerTags?: string[];
}

/** @deprecated use passesUserSegmentTargeting with channel display rules */
export function passesPostPurchaseUserTargeting(
  channel: PostPurchasePageChannel | undefined,
  input: PostPurchaseTargetingInput,
): boolean {
  return passesUserSegmentTargeting(channel, input);
}

/** @deprecated use widgetRecurrenceMode */
export function postPurchaseWidgetRecurrence(
  channel: PostPurchasePageChannel | undefined,
): "once_per_customer" | "every_order" {
  return widgetRecurrenceMode(channel);
}

/** @deprecated use passesWidgetRecurrence */
export function passesPostPurchaseRecurrence(
  channel: PostPurchasePageChannel | undefined,
  hasPriorResponse: boolean,
): boolean {
  return passesWidgetRecurrence(channel, hasPriorResponse);
}
