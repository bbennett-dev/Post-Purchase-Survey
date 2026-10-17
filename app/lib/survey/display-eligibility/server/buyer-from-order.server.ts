import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { lifecycleFromOrderCount } from "../rules/buyer-lifecycle";
import type { BuyerLifecycle } from "../types";

const ORDER_BUYER_QUERY = `#graphql
  query SurveyDisplayEligibilityOrder($id: ID!) {
    order(id: $id) {
      customer {
        id
        tags
        numberOfOrders
      }
    }
  }
`;

function stripGidNumeric(gid: string | null | undefined): string | null {
  if (!gid || typeof gid !== "string") {
    return null;
  }
  const tail = gid.split("/").pop();
  return tail && /^\d+$/.test(tail) ? tail : null;
}

export interface OrderBuyerSnapshot {
  lifecycle: BuyerLifecycle;
  customerTags: string[];
  customerId: string | null;
  customerGid: string | null;
}

/** Loads buyer segment hints from an order (shared across channel resolvers). */
export async function loadBuyerFromOrder(
  admin: AdminApiContext,
  orderId: string,
): Promise<OrderBuyerSnapshot> {
  try {
    const response = await admin.graphql(ORDER_BUYER_QUERY, {
      variables: { id: orderId },
    });
    const { data } = (await response.json()) as {
      data?: {
        order?: {
          customer?: {
            id?: string;
            tags?: string[];
            numberOfOrders?: number;
          } | null;
        } | null;
      };
    };
    const customer = data?.order?.customer;
    if (!customer?.id) {
      return {
        lifecycle: "unknown",
        customerTags: [],
        customerId: null,
        customerGid: null,
      };
    }
    return {
      lifecycle: lifecycleFromOrderCount(customer.numberOfOrders),
      customerTags: customer.tags ?? [],
      customerId: stripGidNumeric(customer.id),
      customerGid: customer.id,
    };
  } catch (error) {
    console.warn("survey-display-eligibility: order lookup failed", error);
    return {
      lifecycle: "unknown",
      customerTags: [],
      customerId: null,
      customerGid: null,
    };
  }
}
