import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

/** Pages supported by the checkout and accounts editor deep link. */
export type CheckoutEditorPage = "thank-you" | "order-status";

export interface CheckoutEditorLinks {
  /** Opens Thank you page with Apps sidebar (`context=apps`). */
  thankYou: string;
  /** Opens Order status page with Apps sidebar. */
  orderStatus: string;
  shopHandle: string;
  profileId: string | null;
}

/**
 * Store slug used in admin.shopify.com URLs (e.g. goodwork15.myshopify.com → goodwork15).
 */
export function shopHandleFromDomain(myshopifyDomain: string): string {
  return myshopifyDomain.replace(/\.myshopify\.com$/i, "").toLowerCase();
}

/**
 * Numeric profile id from a CheckoutProfile GID for editor URLs.
 */
export function checkoutProfileIdFromGid(gid: string): string | null {
  const match = gid.match(/CheckoutProfile\/(\d+)/);
  return match?.[1] ?? null;
}

/**
 * Builds the merchant checkout editor URL used to place app blocks.
 *
 * @example
 * https://admin.shopify.com/store/goodwork15/settings/checkout/editor/profiles/8928723234?page=thank-you&context=apps
 *
 * @see https://shopify.dev/docs/apps/build/checkout/thank-you-order-status
 */
export function buildCheckoutEditorUrl(
  shopHandle: string,
  profileId: string,
  page: CheckoutEditorPage,
): string {
  const params = new URLSearchParams({
    page,
    context: "apps",
  });
  return `https://admin.shopify.com/store/${encodeURIComponent(shopHandle)}/settings/checkout/editor/profiles/${profileId}?${params.toString()}`;
}

function checkoutSettingsFallback(shopHandle: string): string {
  return `https://admin.shopify.com/store/${encodeURIComponent(shopHandle)}/settings/checkout`;
}

/**
 * Resolves published checkout profile links for Thank you and Order status placement.
 */
export async function fetchCheckoutEditorLinks(
  admin: AdminApiContext,
  myshopifyDomain: string,
): Promise<CheckoutEditorLinks> {
  const shopHandle = shopHandleFromDomain(myshopifyDomain);
  let profileId: string | null = null;

  try {
    const response = await admin.graphql(`#graphql
      query PublishedCheckoutProfile {
        checkoutProfiles(first: 1, query: "is_published:true") {
          edges {
            node {
              id
            }
          }
        }
      }
    `);
    const body = (await response.json()) as {
      data?: {
        checkoutProfiles?: {
          edges?: { node?: { id?: string } }[];
        };
      };
      errors?: { message: string }[];
    };

    const gid = body.data?.checkoutProfiles?.edges?.[0]?.node?.id;
    if (typeof gid === "string") {
      profileId = checkoutProfileIdFromGid(gid);
    }
  } catch (error) {
    console.warn("fetchCheckoutEditorLinks: checkoutProfiles query failed", error);
  }

  if (!profileId) {
    const fallback = checkoutSettingsFallback(shopHandle);
    return {
      thankYou: fallback,
      orderStatus: fallback,
      shopHandle,
      profileId: null,
    };
  }

  return {
    thankYou: buildCheckoutEditorUrl(shopHandle, profileId, "thank-you"),
    orderStatus: buildCheckoutEditorUrl(shopHandle, profileId, "order-status"),
    shopHandle,
    profileId,
  };
}
