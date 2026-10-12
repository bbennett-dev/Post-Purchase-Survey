import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { firstSurvey, readCheckoutSurveys, SurveyBlock } from "./shared.jsx";

/**
 * Thank you page target (`purchase.thank-you.block.render`).
 */
export default async () => {
  render(<ThankYouSurvey />, document.body);
};

function ThankYouSurvey() {
  const surveys = readCheckoutSurveys(shopify.appMetafields.value);
  const survey = firstSurvey(surveys);
  const orderId =
    shopify.orderConfirmation?.value?.order?.id ??
    shopify.orderConfirmation?.value?.id ??
    null;

  return <SurveyBlock survey={survey} orderId={orderId} />;
}
