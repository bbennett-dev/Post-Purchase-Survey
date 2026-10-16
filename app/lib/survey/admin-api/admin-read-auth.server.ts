import { ADMIN_API_READ_LIMIT } from "../../security/rate-limit-config.server";
import { checkRateLimit } from "../../security/rate-limit.server";
import { rateLimitExceededResponse } from "../../security/rate-limit-response.server";
import { shopFromAdminSession } from "../../shop/shop.server";
import type { ShopRecord } from "../../shop/shop.server";
import { authenticate } from "../../../shopify.server";

export type AdminReadContext = {
  session: Awaited<ReturnType<typeof authenticate.admin>>["session"];
  shop: ShopRecord;
};

/** `authenticate.admin` + shop tenant + read rate limit for `GET /api/*`. */
export async function adminApiReadContext(
  request: Request,
): Promise<AdminReadContext | Response> {
  const { session } = await authenticate.admin(request);
  const limit = checkRateLimit(
    `admin-api-read:${session.shop}`,
    ADMIN_API_READ_LIMIT,
  );
  if (!limit.allowed) {
    return rateLimitExceededResponse(limit);
  }
  const shop = await shopFromAdminSession(session);
  return { session, shop };
}
