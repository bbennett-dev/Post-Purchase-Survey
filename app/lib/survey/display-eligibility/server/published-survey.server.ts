import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import type { PublishedSurveyPayload } from "../../publish";
import type { PostPurchasePageChannel, SurveyChannel } from "../../types";

const CONFIG_KEY = "__config";

const SHOP_CHECKOUT_SURVEYS_QUERY = `#graphql
  query ShopCheckoutSurveysMetafield {
    shop {
      metafield(namespace: "$app", key: "checkout_surveys") {
        value
      }
    }
  }
`;

export function parseCheckoutSurveysMetafieldValue(
  raw: string | null | undefined,
): Record<string, PublishedSurveyPayload | unknown> | null {
  if (!raw || typeof raw !== "string") {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Loads a published survey payload from the shop `$app.checkout_surveys` metafield.
 */
export async function loadPublishedSurveyFromShopMetafield(
  admin: AdminApiContext,
  surveyUuid: string,
): Promise<PublishedSurveyPayload | null> {
  const response = await admin.graphql(SHOP_CHECKOUT_SURVEYS_QUERY);
  const { data } = (await response.json()) as {
    data?: { shop?: { metafield?: { value?: string } | null } };
  };
  const root = parseCheckoutSurveysMetafieldValue(
    data?.shop?.metafield?.value ?? null,
  );
  if (!root) {
    return null;
  }
  const entry = root[surveyUuid.trim()];
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const payload = entry as PublishedSurveyPayload;
  if (!payload.id || !payload.channels) {
    return null;
  }
  return payload;
}

export function publishedChannelFromPayload<T extends SurveyChannel>(
  payload: PublishedSurveyPayload | null,
  channelKey: string,
): T | undefined {
  const channel = payload?.channels?.[channelKey];
  if (!channel || channel.enabled !== true) {
    return undefined;
  }
  return channel as T;
}

export function postPurchaseChannelFromPublished(
  payload: PublishedSurveyPayload | null,
): PostPurchasePageChannel | undefined {
  return publishedChannelFromPayload<PostPurchasePageChannel>(
    payload,
    "postPurchasePage",
  );
}

export { CONFIG_KEY };
