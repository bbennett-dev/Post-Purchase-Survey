import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { firstSurvey, readCheckoutSurveys, SurveyBlock } from "./shared.jsx";

/**
 * Order status target (`customer-account.order-status.block.render`).
 */
export default async () => {
  render(<OrderStatusSurvey />, document.body);
};

function OrderStatusSurvey() {
  const surveys = readCheckoutSurveys(shopify.appMetafields.value);
  const survey = firstSurvey(surveys);
  const orderId = shopify.order?.value?.id ?? null;

  return <SurveyBlock survey={survey} orderId={orderId} />;
}
