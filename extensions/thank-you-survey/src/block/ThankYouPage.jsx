import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { CHECKOUT_CHANNEL_KEY } from "../shared/channel-config.js";
import { readThankYouOrderId } from "../shared/lib/order-id.js";
import { buildSubmissionContext } from "../shared/survey/submission-context.js";
import { resolveSurveyThankYou } from "../shared/survey/thank-you.js";
import { shouldRenderPostPurchaseBlock } from "../shared/survey/post-purchase-display.js";
import {
  firstSurveyForChannel,
  readCheckoutConfig,
  readCheckoutSurveys,
  SurveyBlock,
} from "../shared/index.jsx";

/**
 * Thank you page target (`purchase.thank-you.block.render`).
 */
export default async () => {
  render(<ThankYouSurvey />, document.body);
};

function ThankYouSurvey() {
  const surveys = readCheckoutSurveys(shopify.appMetafields.value);
  const config = readCheckoutConfig(surveys);
  const survey = firstSurveyForChannel(surveys, CHECKOUT_CHANNEL_KEY);

  if (!shouldRenderPostPurchaseBlock(survey)) {
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
    <SurveyBlock
      survey={survey}
      orderId={orderId}
      submitUrl={submitUrl}
      pageType="thank-you"
      channelType={CHECKOUT_CHANNEL_KEY}
      submissionContext={submissionContext}
    />
  );
}
