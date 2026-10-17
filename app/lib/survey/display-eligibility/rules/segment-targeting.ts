import type {
  SurveyChannelDisplayRules,
  SurveyCustomerSegmentGroup,
} from "../../types";
import type { BuyerSegmentInput } from "../types";

function matchCustomerSegmentGroup(
  group: SurveyCustomerSegmentGroup,
  customerTags: string[],
): boolean {
  const needed = group.condition?.tags ?? [];
  if (needed.length === 0) {
    return false;
  }
  const operator = group.condition?.operator ?? "include";
  const tagSet = new Set(customerTags.map((tag) => tag.trim()).filter(Boolean));
  if (operator === "include") {
    return needed.some((tag) => tagSet.has(tag));
  }
  return !needed.some((tag) => tagSet.has(tag));
}

/**
 * Whether the buyer matches channel user targeting (all users vs segment).
 * Shared by post-purchase and future channels that store the same targeting shape.
 */
export function passesUserSegmentTargeting(
  rules: SurveyChannelDisplayRules | undefined,
  input: BuyerSegmentInput,
): boolean {
  const targeting = rules?.userTargeting;
  if (!targeting || targeting.type !== "segment") {
    return true;
  }

  const wantsReturn = targeting.returnCustomer === true;
  const wantsNew = targeting.newCustomer === true;
  const groups = (targeting.customerSegment ?? []).filter(
    (group) => group.enabled !== false,
  );
  const tags = input.customerTags ?? [];

  let lifecycleOk = false;
  if (wantsReturn || wantsNew) {
    if (input.lifecycle === "new" && wantsNew) {
      lifecycleOk = true;
    }
    if (input.lifecycle === "return" && wantsReturn) {
      lifecycleOk = true;
    }
  }

  const groupOk =
    groups.length > 0 &&
    groups.some((group) => matchCustomerSegmentGroup(group, tags));

  if (groups.length === 0) {
    if (!wantsReturn && !wantsNew) {
      return false;
    }
    if (input.lifecycle === "unknown") {
      return false;
    }
    return lifecycleOk;
  }

  if (!wantsReturn && !wantsNew) {
    return groupOk;
  }

  return lifecycleOk || groupOk;
}
