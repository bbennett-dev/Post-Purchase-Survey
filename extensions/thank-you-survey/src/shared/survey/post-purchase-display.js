import { CHECKOUT_CHANNEL_KEY } from "../channel-config.js";

export const DEFAULT_POST_PURCHASE_DISPLAY_TYPE = "blockType";
export const POST_PURCHASE_ANNOUNCEMENT_DISPLAY_TYPE = "announcementBarType";

export function postPurchaseChannelFromSurvey(survey) {
  return survey?.channels?.[CHECKOUT_CHANNEL_KEY] ?? null;
}

export function postPurchaseDisplayTypeFromSurvey(survey) {
  const channel = postPurchaseChannelFromSurvey(survey);
  const value = channel?.displayType?.trim();
  if (!value) {
    return DEFAULT_POST_PURCHASE_DISPLAY_TYPE;
  }
  return value;
}

export function isPostPurchaseAnnouncementBarSurvey(survey) {
  return (
    postPurchaseDisplayTypeFromSurvey(survey) ===
    POST_PURCHASE_ANNOUNCEMENT_DISPLAY_TYPE
  );
}

export function shouldRenderPostPurchaseBlock(survey) {
  if (!survey) {
    return false;
  }
  return !isPostPurchaseAnnouncementBarSurvey(survey);
}

export function shouldRenderPostPurchaseAnnouncement(survey) {
  if (!survey) {
    return false;
  }
  return isPostPurchaseAnnouncementBarSurvey(survey);
}

export function resolvePostPurchaseAnnouncementCopy(survey) {
  const channel = postPurchaseChannelFromSurvey(survey);
  const bar = channel?.announcementBar ?? {};
  const fallbackName = survey?.name?.trim() || "Survey";

  const content = bar.content?.trim() || "We'd love to hear your feedback!";
  const buttonText = bar.buttonText?.trim() || "Take a quick survey";
  const modalTitle = bar.modalTitle?.trim() || fallbackName;

  return { modalTitle, content, buttonText };
}
