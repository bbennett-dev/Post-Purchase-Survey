import type { ActionFunctionArgs } from "react-router";
import { deleteAllShopSurveyData } from "../lib/survey/survey-store.server";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * Mandatory GDPR webhook: customer redact.
 * Removes survey responses tied to the shop when Shopify requests erasure.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  const customerId =
    typeof payload === "object" &&
    payload !== null &&
    "customer" in payload &&
    typeof (payload as { customer?: { id?: string } }).customer?.id === "string"
      ? (payload as { customer: { id: string } }).customer.id
      : null;

  if (customerId) {
    await db.surveyResponse.deleteMany({
      where: { shop, customerId },
    });
  }

  return new Response();
};
