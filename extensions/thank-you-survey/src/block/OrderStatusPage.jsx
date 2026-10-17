import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { CHECKOUT_CHANNEL_KEY } from "../shared/channel-config.js";
import { buildSubmissionContext } from "../shared/survey/submission-context.js";
import { resolveSurveyThankYou } from "../shared/survey/thank-you.js";
import { shouldRenderPostPurchaseBlock } from "../shared/survey/post-purchase-display.js";
import {
  firstSurveyForChannel,
  readCheckoutConfig,
  readCheckoutSurveys,
  SurveyBlock,
} from "../shared/index.jsx";
import { PostPurchaseSurveyGate } from "../shared/survey/PostPurchaseSurveyGate.jsx";

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

  if (!shouldRenderPostPurchaseBlock(survey)) {
    return null;
  }

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
    <PostPurchaseSurveyGate
      survey={survey}
      config={config}
      surface="order-status"
      orderId={orderId}
    >
      <SurveyBlock
        survey={survey}
        orderId={orderId}
        submitUrl={submitUrl}
        pageType="order-status"
        channelType={CHECKOUT_CHANNEL_KEY}
        submissionContext={submissionContext}
      />
    </PostPurchaseSurveyGate>
  );
}
