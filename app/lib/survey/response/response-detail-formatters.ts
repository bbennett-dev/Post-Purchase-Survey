import type { SurveyResponseListItemDto } from "./response-api.mapper";
import type { SurveyResponseMetaVariant } from "./survey-response.types";

export function displayOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

/** Detail header subtitle (competitor: "Submitted at Oct 15, 2026 at 16:36 PM"). */
export function formatResponseDetailSubmittedAt(iso: string): string {
  const date = new Date(iso);
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `Submitted at ${formatted.replace(",", " at")}`;
}

export function formatPageSubmittedLabel(pageType: string | null): string {
  if (!pageType?.trim()) {
    return "—";
  }
  if (pageType === "thank-you") {
    return "Thank you page";
  }
  if (pageType === "order-status") {
    return "Order status page";
  }
  return pageType.replace(/-/g, " ");
}

export function productLineCount(dto: SurveyResponseListItemDto): number {
  if (dto.variants.length > 0) {
    return dto.variants.length;
  }
  return dto.productName?.trim() ? 1 : 0;
}

export function productCountLabel(count: number): string {
  if (count === 0) {
    return "—";
  }
  return `${count} product${count === 1 ? "" : "s"}`;
}

export function primaryCustomerTag(dto: SurveyResponseListItemDto): string {
  const tag = dto.customerTags[0] ?? dto.customer?.tags?.[0];
  return tag?.trim() ? tag.trim() : "—";
}

export function customerEmail(dto: SurveyResponseListItemDto): string {
  return displayOrDash(dto.email ?? dto.customer?.email ?? null);
}

export function deliveryMethodTypeLabel(type: string | null): string | null {
  if (!type?.trim()) {
    return null;
  }
  const normalized = type.trim().toLowerCase();
  if (normalized === "shipping") {
    return "Shipping";
  }
  if (normalized === "pickup" || normalized === "pick-up") {
    return "Pickup";
  }
  return type.trim();
}

export function variantDisplayTitle(variant: SurveyResponseMetaVariant): string {
  return (
    variant.title?.trim() ||
    variant.product?.title?.trim() ||
    "—"
  );
}

/** Product name row in the hover popover (competitor primary line). */
export function variantProductLineTitle(
  variant: SurveyResponseMetaVariant,
  fallbackProductName: string | null,
): string {
  return (
    variant.product?.title?.trim() ||
    fallbackProductName?.trim() ||
    variant.title?.trim() ||
    "—"
  );
}

/** Variant / option row under the product title. */
export function variantProductLineSubtitle(
  variant: SurveyResponseMetaVariant,
): string {
  const variantTitle = variant.title?.trim();
  const productTitle = variant.product?.title?.trim();
  if (variantTitle && variantTitle !== productTitle) {
    return variantTitle;
  }
  return variantTitle || "—";
}
