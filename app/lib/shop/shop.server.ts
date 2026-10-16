import prisma from "../../db.server";

/** Resolved tenant for app data access (internal id + public uuid + Shopify domain). */
export interface ShopRecord {
  shopId: bigint;
  shopUuid: string;
  myshopifyDomain: string;
}

/**
 * Ensures a Shop row exists for the myshopify domain (OAuth / checkout session dest).
 */
export async function getOrCreateShopByDomain(
  myshopifyDomain: string,
): Promise<ShopRecord> {
  const domain = myshopifyDomain.trim().toLowerCase();
  if (!domain) {
    throw new Error("Shop domain is required");
  }

  const existing = await prisma.shop.findUnique({
    where: { myshopifyDomain: domain },
  });
  if (existing) {
    return {
      shopId: existing.id,
      shopUuid: existing.shopUuid,
      myshopifyDomain: existing.myshopifyDomain,
    };
  }

  const created = await prisma.shop.create({
    data: { myshopifyDomain: domain },
  });
  return {
    shopId: created.id,
    shopUuid: created.shopUuid,
    myshopifyDomain: created.myshopifyDomain,
  };
}

/** After `authenticate.admin`, resolve tenant from session.shop. */
export async function shopFromAdminSession(session: {
  shop: string;
}): Promise<ShopRecord> {
  return getOrCreateShopByDomain(session.shop);
}
