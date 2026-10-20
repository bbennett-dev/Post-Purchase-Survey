import type { SurveyDocument } from "./types";

/**
 * Channel keys delivered through the shop `$app.checkout_surveys` metafield
 * (checkout / customer-account UI extensions). Add keys here when a runtime ships.
 */
export const CHECKOUT_SURVEYS_CHANNEL_KEYS = ["postPurchasePage"] as const;

export type CheckoutSurveysChannelKey =
  (typeof CHECKOUT_SURVEYS_CHANNEL_KEYS)[number];

/** Whether the survey has at least one enabled channel (any key in `document.channels`). */
export function surveyHasAnyEnabledChannel(document: SurveyDocument): boolean {
  return Object.values(document.channels ?? {}).some(
    (channel) => channel?.enabled === true,
  );
}

/** Whether the survey is enabled for checkout UI metafield delivery. */
export function surveyHasCheckoutSurveysChannel(
  document: SurveyDocument,
): boolean {
  return CHECKOUT_SURVEYS_CHANNEL_KEYS.some(
    (key) => document.channels?.[key]?.enabled === true,
  );
}

/**
 * Whether a channel should appear as enabled in admin lists.
 * `channels[].enabled` is authoritative; `channelTypes` covers legacy saves.
 */
export function isSurveyChannelEnabled(
  document: SurveyDocument,
  channelKey: string,
): boolean {
  const channel = document.channels?.[channelKey];
  if (!channel) {
    return false;
  }
  if (channel.enabled === true) {
    return true;
  }
  if (channel.enabled === false) {
    return false;
  }
  return (document.channelTypes ?? []).includes(channelKey);
}

/** Human-readable labels for enabled channels on a document. */
export function enabledChannelLabels(
  document: SurveyDocument,
  labelsByKey: Record<string, string>,
): string[] {
  return Object.entries(document.channels ?? {})
    .filter(([key]) => isSurveyChannelEnabled(document, key))
    .map(([key]) => labelsByKey[key] ?? key);
}
