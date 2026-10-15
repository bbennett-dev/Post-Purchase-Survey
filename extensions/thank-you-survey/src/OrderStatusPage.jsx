import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { CHECKOUT_CHANNEL_KEY } from "./channel-config.js";
import { buildSubmissionContext } from "./survey/submission-context.js";
import { resolveSurveyThankYou } from "./survey/thank-you.js";
import {
  firstSurveyForChannel,
  readCheckoutConfig,
  readCheckoutSurveys,
  SurveyBlock,
} from "./shared.jsx";

/**
 * Order status target (`customer-account.order-status.block.render`).
 */
export default async () => {
  render(<OrderStatusSurvey />, document.body);
};

function OrderStatusSurvey() {
  const surveys = readCheckoutSurveys(shopify.appMetafields.value);
  const config = readCheckoutConfig(surveys);
  const survey = firstSurveyForChannel(surveys, CHECKOUT_CHANNEL_KEY);
  const orderId = shopify.order?.value?.id ?? null;
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
    <SurveyBlock
      survey={survey}
      orderId={orderId}
      submitUrl={submitUrl}
      pageType="order-status"
      channelType={CHECKOUT_CHANNEL_KEY}
      submissionContext={submissionContext}
    />
  );
}
