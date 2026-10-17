import { resolveSurveyDisplayEligibility } from "./display-eligibility/server/resolve-display-eligibility.server";
import type {
  ResolveSurveyDisplayEligibilityInput,
  SurveyDisplayEligibilityResult,
} from "./display-eligibility/types.ts";

export type ResolvePostPurchaseEligibilityInput = Omit<
  ResolveSurveyDisplayEligibilityInput,
  "channelKey"
>;

export type PostPurchaseEligibilityResult = SurveyDisplayEligibilityResult;

/**
 * Post-purchase thank-you / order-status eligibility (delegates to generic resolver).
 */
export async function resolvePostPurchaseEligibility(
  input: ResolvePostPurchaseEligibilityInput,
): Promise<PostPurchaseEligibilityResult> {
  return resolveSurveyDisplayEligibility({
    ...input,
    channelKey: "postPurchasePage",
  });
}
