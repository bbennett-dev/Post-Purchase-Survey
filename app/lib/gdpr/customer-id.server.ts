/**
 * Normalize Shopify customer identifiers for DB compare (numeric string).
 */
export function normalizeShopifyCustomerId(
  input: string | number | null | undefined,
): string | null {
  if (input == null) {
    return null;
  }
  if (typeof input === "number" && Number.isFinite(input)) {
    return String(Math.trunc(input));
  }
  const raw = String(input).trim();
  if (!raw) {
    return null;
  }
  const gidMatch = /^gid:\/\/shopify\/Customer\/(\d+)$/i.exec(raw);
  if (gidMatch?.[1]) {
    return gidMatch[1];
  }
  if (/^\d+$/.test(raw)) {
    return raw;
  }
  return null;
}

/** Values that may appear in `SurveyResponse.customerId` for the same customer. */
export function shopifyCustomerIdMatchValues(
  input: string | number | null | undefined,
): string[] {
  const normalized = normalizeShopifyCustomerId(input);
  if (!normalized) {
    return [];
  }
  return [normalized, `gid://shopify/Customer/${normalized}`];
}
