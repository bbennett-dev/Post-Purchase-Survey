import type { ActionFunctionArgs } from "react-router";
import { shopifyCustomerIdMatchValues } from "../lib/gdpr/customer-id.server";
import { customerFromCompliancePayload } from "../lib/gdpr/webhook-payload.server";
import { getOrCreateShopByDomain } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * Mandatory GDPR webhook: customer redact.
 * HMAC verified by `authenticate.webhook` (Shopify app library) before this runs.
 * Removes survey responses tied to the shop when Shopify requests erasure.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  try {
    const { id, email } = customerFromCompliancePayload(payload);
    const idValues = shopifyCustomerIdMatchValues(id);
    const orFilters: { customerId?: { in: string[] }; email?: string }[] = [];
    if (idValues.length) {
      orFilters.push({ customerId: { in: idValues } });
    }
    if (email) {
      orFilters.push({ email });
    }

    if (orFilters.length) {
      const tenant = await getOrCreateShopByDomain(shop);
      const result = await db.surveyResponse.deleteMany({
        where: { shopId: tenant.shopId, OR: orFilters },
      });
      console.info(`GDPR ${topic}`, {
        shop,
        customerId: id,
        deletedCount: result.count,
      });
    } else {
      console.info(`GDPR ${topic}`, { shop, customerId: id, deletedCount: 0 });
    }
  } catch (error) {
    console.error(`GDPR ${topic} failed`, { shop, error });
    return new Response(null, { status: 500 });
  }

  return new Response();
};
