import { normalizeShopifyCustomerId } from "./customer-id.server";

export type WebhookCustomerRef = {
  id: string | null;
  email: string | null;
};

/** Parses customer id/email from Shopify compliance webhook payloads. */
export function customerFromCompliancePayload(
  payload: unknown,
): WebhookCustomerRef {
  if (!payload || typeof payload !== "object") {
    return { id: null, email: null };
  }
  const customer = (payload as { customer?: Record<string, unknown> }).customer;
  if (!customer || typeof customer !== "object") {
    return { id: null, email: null };
  }

  const rawId = customer.id;
  let id: string | null = null;
  if (typeof rawId === "number" || typeof rawId === "string") {
    id = normalizeShopifyCustomerId(rawId);
  }

  const rawEmail = customer.email;
  const email =
    typeof rawEmail === "string" && rawEmail.trim().includes("@")
      ? rawEmail.trim().toLowerCase()
      : null;

  return { id, email };
}
