import type { ActionFunctionArgs } from "react-router";
import { exportCustomerSurveyData } from "../lib/gdpr/customer-data-export.server";
import { fetchShopContactEmails } from "../lib/gdpr/shop-contact.server";
import { customerFromCompliancePayload } from "../lib/gdpr/webhook-payload.server";
import { authenticate } from "../shopify.server";

/**
 * Mandatory GDPR webhook: customer data request.
 * Compiles survey responses for the merchant to fulfill the buyer request.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  try {
    const { id, email } = customerFromCompliancePayload(payload);
    const exportData = await exportCustomerSurveyData(shop, id, email);

    console.info(`GDPR ${topic}`, {
      shop,
      customerId: exportData.customerId,
      recordCount: exportData.recordCount,
    });

    if (exportData.recordCount > 0) {
      const contacts = await fetchShopContactEmails(shop);
      console.info(`GDPR ${topic} merchant contacts`, {
        shop,
        shopEmail: contacts.email,
        contactEmail: contacts.contactEmail,
      });

      const notifyEmail = process.env.GDPR_EXPORT_NOTIFY_EMAIL?.trim();
      if (notifyEmail) {
        console.info(`GDPR ${topic} export snapshot available for support`, {
          shop,
          notifyEmail,
          recordCount: exportData.recordCount,
          exportedAt: exportData.exportedAt,
        });
      }
    }
  } catch (error) {
    console.error(`GDPR ${topic} failed`, { shop, error });
    return new Response(null, { status: 500 });
  }

  return new Response();
};
