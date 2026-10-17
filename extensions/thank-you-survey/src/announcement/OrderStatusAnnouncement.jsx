import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { CHECKOUT_CHANNEL_KEY } from "../shared/channel-config.js";
import { buildSubmissionContext } from "../shared/survey/submission-context.js";
import { resolveSurveyThankYou } from "../shared/survey/thank-you.js";
import {
  firstSurveyForChannel,
  readCheckoutConfig,
  readCheckoutSurveys,
} from "../shared/survey/checkout-data.js";
import { shouldRenderPostPurchaseAnnouncement } from "../shared/survey/post-purchase-display.js";
import { SurveyAnnouncement } from "./SurveyAnnouncement.jsx";

const MODAL_ID = "post-purchase-survey-order-status";

/**
 * Order status announcement target (`customer-account.order-status.announcement.render`).
 */
export default async () => {
  render(<OrderStatusAnnouncementSurvey />, document.body);
};

function OrderStatusAnnouncementSurvey() {
  const surveys = readCheckoutSurveys(shopify.appMetafields.value);
  const config = readCheckoutConfig(surveys);
  const survey = firstSurveyForChannel(surveys, CHECKOUT_CHANNEL_KEY);
  const orderId = shopify.order?.value?.id ?? null;

  if (!shouldRenderPostPurchaseAnnouncement(survey)) {
    return null;
  }

  const submitUrl = config?.submitUrl ?? null;
  const endingCardId = resolveSurveyThankYou(survey)?.id ?? null;
  const submissionContext = buildSubmissionContext({
    surface: "order-status",
    orderId,
    pageType: "order-status",
    channelType: CHECKOUT_CHANNEL_KEY,
    endingCardId,
  });

  return (
    <SurveyAnnouncement
      survey={survey}
      orderId={orderId}
      submitUrl={submitUrl}
      pageType="order-status"
      channelType={CHECKOUT_CHANNEL_KEY}
      submissionContext={submissionContext}
      modalId={MODAL_ID}
    />
  );
}
