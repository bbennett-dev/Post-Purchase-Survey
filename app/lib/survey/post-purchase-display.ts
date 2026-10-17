import type { PostPurchasePageChannel } from "./types";

/** Character limits for post-purchase announcement bar copy (editor + runtime). */
export const ANNOUNCEMENT_CONTENT_MAX_LENGTH = 100;
export const ANNOUNCEMENT_BUTTON_TEXT_MAX_LENGTH = 30;

export const DEFAULT_POST_PURCHASE_DISPLAY_TYPE = "blockType";
export const POST_PURCHASE_ANNOUNCEMENT_DISPLAY_TYPE = "announcementBarType";

export interface ResolvedPostPurchaseAnnouncementCopy {
  modalTitle: string;
  content: string;
  buttonText: string;
}

/**
 * Normalizes post-purchase display type; missing values default to inline block.
 */
export function postPurchaseDisplayType(
  channel: PostPurchasePageChannel | undefined,
): string {
  const value = channel?.displayType?.trim();
  if (!value) {
    return DEFAULT_POST_PURCHASE_DISPLAY_TYPE;
  }
  return value;
}

export function isPostPurchaseAnnouncementBar(
  channel: PostPurchasePageChannel | undefined,
): boolean {
  return (
    postPurchaseDisplayType(channel) === POST_PURCHASE_ANNOUNCEMENT_DISPLAY_TYPE
  );
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, maxLength);
}

/**
 * Merchant-facing announcement copy with editor limits and safe fallbacks.
 */
export function resolvePostPurchaseAnnouncementCopy(
  channel: PostPurchasePageChannel | undefined,
  surveyName?: string,
): ResolvedPostPurchaseAnnouncementCopy {
  const bar = channel?.announcementBar;
  const fallbackName = surveyName?.trim() || "Survey";

  const contentRaw = bar?.content?.trim();
  const content =
    contentRaw && contentRaw.length > 0
      ? truncate(contentRaw, ANNOUNCEMENT_CONTENT_MAX_LENGTH)
      : "We'd love to hear your feedback!";

  const buttonRaw = bar?.buttonText?.trim();
  const buttonText =
    buttonRaw && buttonRaw.length > 0
      ? truncate(buttonRaw, ANNOUNCEMENT_BUTTON_TEXT_MAX_LENGTH)
      : "Take a quick survey";

  const titleRaw = bar?.modalTitle?.trim();
  const modalTitle =
    titleRaw && titleRaw.length > 0 ? titleRaw : fallbackName;

  return { modalTitle, content, buttonText };
}
