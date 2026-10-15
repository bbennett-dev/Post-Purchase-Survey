/**
 * App Store v1 **editor** gating (which channel rows / question types show in admin).
 * Publish and save logic use generic channel keys — not hard-coded here.
 */
export const V1_APP_STORE_SCOPE = true;

/** Channel keys exposed in the editor Channel tab for v1. */
export const V1_CHANNEL_KEYS = ["postPurchasePage"] as const;

export type V1ChannelKey = (typeof V1_CHANNEL_KEYS)[number];

/** Question types in the “Add content” menu and type dropdown for v1. */
export const V1_QUESTION_TYPE_KEYS = [
  "single",
  "multiple",
  "number_scale",
  "star_rating",
  "satisfaction",
] as const;

export type V1QuestionTypeKey = (typeof V1_QUESTION_TYPE_KEYS)[number];

/** When true, editor hides Advanced logic, Discount tab, and non-v1 question types. */
export function isV1EditorLimited(): boolean {
  return V1_APP_STORE_SCOPE;
}
