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
 * Thank you page target (`purchase.thank-you.block.render`).
 */
export default async () => {
  render(<ThankYouSurvey />, document.body);
};

function ThankYouSurvey() {
  const surveys = readCheckoutSurveys(shopify.appMetafields.value);
  const config = readCheckoutConfig(surveys);
  const survey = firstSurveyForChannel(surveys, CHECKOUT_CHANNEL_KEY);

  console.log("shopify.appMetafields.value", shopify.appMetafields.value);
  console.log("config", config);
  console.log("surveys", surveys);
  console.log("survey", survey);


  const orderId =
    shopify.orderConfirmation?.value?.order?.id ??
    shopify.orderConfirmation?.value?.id ??
    null;
  const submitUrl = config?.submitUrl ?? null;

  return (
    <SurveyBlock
      survey={survey}
      orderId={orderId}
      submitUrl={submitUrl}
      pageType="thank-you"
      channelType={CHECKOUT_CHANNEL_KEY}
    />
  );
}
