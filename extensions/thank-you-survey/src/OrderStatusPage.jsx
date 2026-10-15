import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { CHECKOUT_CHANNEL_KEY } from "./channel-config.js";
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

  return (
    <SurveyBlock
      survey={survey}
      orderId={orderId}
      submitUrl={submitUrl}
      pageType="order-status"
      channelType={CHECKOUT_CHANNEL_KEY}
    />
  );
}
