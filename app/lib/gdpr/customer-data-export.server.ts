import prisma from "../../db.server";
import { getOrCreateShopByDomain } from "../shop/shop.server";
import {
  normalizeShopifyCustomerId,
  shopifyCustomerIdMatchValues,
} from "./customer-id.server";

export type ExportedSurveyResponse = {
  responseUuid: string;
  orderId: string;
  orderName: string | null;
  surveyName: string;
  submittedAt: string;
  email: string | null;
  customerId: string | null;
  pageType: string | null;
  channelType: string | null;
  questions: unknown;
  meta: unknown;
};

export type CustomerSurveyDataExport = {
  shopDomain: string;
  customerId: string | null;
  customerEmail: string | null;
  exportedAt: string;
  recordCount: number;
  responses: ExportedSurveyResponse[];
};

function orderNameFromMeta(meta: unknown): string | null {
  if (!meta || typeof meta !== "object") {
    return null;
  }
  const name = (meta as { orderName?: unknown }).orderName;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

function normalizeEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim().toLowerCase();
  return trimmed && trimmed.includes("@") ? trimmed : null;
}

/**
 * Compiles survey responses held for a customer (merchant GDPR / data_request).
 */
export async function exportCustomerSurveyData(
  shopDomain: string,
  customerIdInput: string | number | null | undefined,
  customerEmailInput?: string | null,
): Promise<CustomerSurveyDataExport> {
  const shop = await getOrCreateShopByDomain(shopDomain);
  const customerId = normalizeShopifyCustomerId(customerIdInput);
  const customerEmail = normalizeEmail(customerEmailInput);
  const idValues = shopifyCustomerIdMatchValues(customerIdInput);

  const orFilters: {
    customerId?: { in: string[] };
    email?: string;
  }[] = [];

  if (idValues.length) {
    orFilters.push({ customerId: { in: idValues } });
  }
  if (customerEmail) {
    orFilters.push({ email: customerEmail });
  }

  const rows =
    orFilters.length === 0
      ? []
      : await prisma.surveyResponse.findMany({
          where: {
            shopId: shop.shopId,
            OR: orFilters,
          },
          orderBy: { submittedAt: "desc" },
        });

  const responses: ExportedSurveyResponse[] = rows.map((row) => ({
    responseUuid: row.responseUuid,
    orderId: row.orderId,
    orderName: orderNameFromMeta(row.meta),
    surveyName: row.surveyName,
    submittedAt: row.submittedAt.toISOString(),
    email: row.email,
    customerId: row.customerId,
    pageType: row.pageType,
    channelType: row.channelType,
    questions: row.questions,
    meta: row.meta,
  }));

  return {
    shopDomain: shop.myshopifyDomain,
    customerId,
    customerEmail,
    exportedAt: new Date().toISOString(),
    recordCount: responses.length,
    responses,
  };
}
