import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { CHECKOUT_CHANNEL_KEY } from "../shared/channel-config.js";
import { readThankYouOrderId } from "../shared/lib/order-id.js";
import { buildSubmissionContext } from "../shared/survey/submission-context.js";
import { resolveSurveyThankYou } from "../shared/survey/thank-you.js";
import {
  firstSurveyForChannel,
  readCheckoutConfig,
  readCheckoutSurveys,
} from "../shared/survey/checkout-data.js";
import { shouldRenderPostPurchaseAnnouncement } from "../shared/survey/post-purchase-display.js";
import { SurveyAnnouncement } from "./SurveyAnnouncement.jsx";

const MODAL_ID = "post-purchase-survey-thank-you";

/**
 * Thank you announcement target (`purchase.thank-you.announcement.render`).
 */
export default async () => {
  render(<ThankYouAnnouncementSurvey />, document.body);
};

function ThankYouAnnouncementSurvey() {
  const surveys = readCheckoutSurveys(shopify.appMetafields.value);
  const config = readCheckoutConfig(surveys);
  const survey = firstSurveyForChannel(surveys, CHECKOUT_CHANNEL_KEY);

  if (!shouldRenderPostPurchaseAnnouncement(survey)) {
    return null;
  }

  const orderId = readThankYouOrderId(shopify);
  const submitUrl = config?.submitUrl ?? null;
  const endingCardId = resolveSurveyThankYou(survey)?.id ?? null;
  const submissionContext = buildSubmissionContext({
    surface: "thank-you",
    orderId,
    pageType: "thank-you",
    channelType: CHECKOUT_CHANNEL_KEY,
    endingCardId,
  });

  return (
    <SurveyAnnouncement
      survey={survey}
      orderId={orderId}
      submitUrl={submitUrl}
      pageType="thank-you"
      channelType={CHECKOUT_CHANNEL_KEY}
      submissionContext={submissionContext}
      modalId={MODAL_ID}
    />
  );
}
