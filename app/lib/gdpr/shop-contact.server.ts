import { unauthenticated } from "../../shopify.server";

export type ShopContactEmails = {
  email: string | null;
  contactEmail: string | null;
};

/**
 * Merchant shop emails for GDPR fulfillment (offline Admin session).
 */
export async function fetchShopContactEmails(
  myshopifyDomain: string,
): Promise<ShopContactEmails> {
  try {
    const { admin } = await unauthenticated.admin(myshopifyDomain);
    const response = await admin.graphql(`#graphql
      query GdprShopContact {
        shop {
          email
          contactEmail
        }
      }
    `);
    const { data } = (await response.json()) as {
      data?: {
        shop?: { email?: string | null; contactEmail?: string | null };
      };
    };
    const shop = data?.shop;
    return {
      email: shop?.email?.trim() || null,
      contactEmail: shop?.contactEmail?.trim() || null,
    };
  } catch (error) {
    console.error("fetchShopContactEmails", myshopifyDomain, error);
    return { email: null, contactEmail: null };
  }
}
