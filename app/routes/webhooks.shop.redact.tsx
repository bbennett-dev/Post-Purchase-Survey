import type { ActionFunctionArgs } from "react-router";
import { deleteAllShopSurveyData } from "../lib/survey/survey-store.server";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * Mandatory GDPR webhook: shop redact (48h after uninstall).
 * Deletes persisted survey documents and responses for the shop.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);

  try {
    await deleteAllShopSurveyData(shop);
    await db.session.deleteMany({ where: { shop } });
    console.info(`GDPR ${topic}`, { shop });
  } catch (error) {
    console.error(`GDPR ${topic} failed`, { shop, error });
    return new Response(null, { status: 500 });
  }

  return new Response();
};
