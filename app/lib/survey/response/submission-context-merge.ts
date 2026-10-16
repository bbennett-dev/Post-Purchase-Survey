import type { SurveySubmissionContext } from "./survey-response.types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasClientValue(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "number") {
    return !Number.isNaN(value);
  }
  if (typeof value === "boolean") {
    return true;
  }
  return false;
}

/** True only for Admin-queryable order resources (not OrderIdentity/0 or surrogates). */
export function isShopifyOrderGid(orderId: string | undefined | null): boolean {
  if (!isNonEmptyString(orderId)) {
    return false;
  }
  return /^gid:\/\/shopify\/Order\/\d+$/i.test(orderId.trim());
}

/**
 * Shallow merge: `base` (client) wins when non-empty; `patch` fills gaps only.
 */
export function mergeSubmissionContext(
  base: SurveySubmissionContext | undefined,
  patch: SurveySubmissionContext | undefined,
): SurveySubmissionContext {
  const out: SurveySubmissionContext = { ...(patch ?? {}) };

  if (!base) {
    return out;
  }

  for (const [key, value] of Object.entries(base) as [
    keyof SurveySubmissionContext,
    SurveySubmissionContext[keyof SurveySubmissionContext],
  ][]) {
    if (hasClientValue(value)) {
      (out as Record<string, unknown>)[key] = value;
    }
  }

  if (base.lineItems?.length && !out.lineItems?.length) {
    out.lineItems = base.lineItems;
  } else if (base.lineItems?.length && out.lineItems?.length) {
    out.lineItems = base.lineItems.map((item, index) => ({
      ...out.lineItems![index],
      ...item,
    }));
  }

  return out;
}

export function needsOrderEnrichment(
  orderId: string,
  ctx: SurveySubmissionContext,
): boolean {
  if (!isShopifyOrderGid(orderId)) {
    return false;
  }
  return (
    !hasClientValue(ctx.orderName) ||
    !hasClientValue(ctx.deliveryMethodType) ||
    !hasClientValue(ctx.customerEmail) ||
    !hasClientValue(ctx.customerId) ||
    !ctx.lineItems?.length
  );
}

export function needsCustomerEmailLookup(ctx: SurveySubmissionContext): boolean {
  if (!hasClientValue(ctx.customerEmail)) {
    return false;
  }
  return !hasClientValue(ctx.customerId) || !hasClientValue(ctx.customerName);
}

export function needsVariantHydration(ctx: SurveySubmissionContext): boolean {
  const ids = ctx.variantIds ?? [];
  const items = ctx.lineItems ?? [];
  if (ids.length === 0 && items.length === 0) {
    return false;
  }
  if (items.some((item) => item.featuredImageUrl || item.variantTitle)) {
    return false;
  }
  return ids.length > 0 || items.some((item) => item.variantId);
}

export function needsProductNameLookup(ctx: SurveySubmissionContext): boolean {
  return (
    hasClientValue(ctx.productId) && !hasClientValue(ctx.productName)
  );
}

export function adminEnrichmentNeeded(
  orderId: string,
  ctx: SurveySubmissionContext,
): boolean {
  return (
    needsOrderEnrichment(orderId, ctx) ||
    needsCustomerEmailLookup(ctx) ||
    needsVariantHydration(ctx) ||
    needsProductNameLookup(ctx)
  );
}
