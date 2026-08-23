import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  findCustomerSurveyData,
  redactCustomerData,
  redactShopData,
} from "../lib/survey.server";

interface ComplianceCustomer {
  id?: number | string;
  email?: string;
  phone?: string;
}

interface CompliancePayload {
  shop_id?: number;
  shop_domain?: string;
  customer?: ComplianceCustomer;
  orders_requested?: Array<number | string>;
  orders_to_redact?: Array<number | string>;
  data_request?: { id?: number | string };
}

function toCustomerGid(id: number | string | undefined): string | null {
  if (id === undefined || id === null || id === "") {
    return null;
  }
  return `gid://shopify/Customer/${id}`;
}

function toOrderGids(ids: Array<number | string> | undefined): string[] {
  if (!ids) {
    return [];
  }
  return ids.map((id) => `gid://shopify/Order/${id}`);
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);
  const body = payload as CompliancePayload;

  console.log(`Received ${topic} webhook for ${shop}`);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST": {
      const records = await findCustomerSurveyData({
        shop,
        customerGid: toCustomerGid(body.customer?.id),
        orderGids: toOrderGids(body.orders_requested),
      });
      console.log(
        `customers/data_request ${body.data_request?.id ?? "unknown"}: ${records.length} survey record(s) for ${shop}`,
      );
      break;
    }
    case "CUSTOMERS_REDACT": {
      const deleted = await redactCustomerData({
        shop,
        customerGid: toCustomerGid(body.customer?.id),
        orderGids: toOrderGids(body.orders_to_redact),
      });
      console.log(`customers/redact: deleted ${deleted} survey response(s) for ${shop}`);
      break;
    }
    case "SHOP_REDACT": {
      await redactShopData(shop);
      console.log(`shop/redact: removed survey data for ${shop}`);
      break;
    }
    default:
      console.log(`Unhandled compliance topic ${topic}`);
  }

  return new Response();
};
