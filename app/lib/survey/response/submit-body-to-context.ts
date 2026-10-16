import type { SurveySubmissionContext, SurveySubmissionLineItem } from "./survey-response.types";

export interface SurveyResponseSubmitBody {
  orderId?: string;
  surveyId?: string;
  surveyName?: string;
  answers?: unknown;
  answerId?: string;
  answerLabel?: string;
  customText?: string | null;
  pageType?: string | null;
  channelType?: string | null;
  displayType?: string | null;
  orderName?: string | null;
  surveyType?: string | null;
  email?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerTags?: string[] | null;
  productId?: string | null;
  productName?: string | null;
  variantIds?: string[] | null;
  collectionId?: string | null;
  country?: string | null;
  deviceType?: string | null;
  completionTime?: number | null;
  completionRate?: number | null;
  endingCardId?: string | null;
  endingCardName?: string | null;
  attributionSource?: string | null;
  pageUrl?: string | null;
  isDiscount?: boolean | null;
  lineItems?: SurveySubmissionLineItem[];
}

function lineItemsFromBody(body: SurveyResponseSubmitBody): SurveySubmissionLineItem[] | undefined {
  if (body.lineItems?.length) {
    return body.lineItems;
  }
  const variantIds = body.variantIds ?? [];
  if (variantIds.length === 0 && !body.productId) {
    return undefined;
  }
  return variantIds.map((variantId) => ({
    variantId: String(variantId),
    productId: body.productId ?? null,
    productTitle: body.productName ?? null,
  }));
}

/** Maps extension POST JSON to channel-agnostic submission context (sparse-safe). */
export function submitBodyToContext(
  body: SurveyResponseSubmitBody,
): SurveySubmissionContext {
  const ctx: SurveySubmissionContext = {
    pageType: body.pageType,
    channelType: body.channelType,
    displayType: body.displayType,
    orderName: body.orderName,
    surveyType: body.surveyType,
    customerEmail: body.email ?? undefined,
    customerName: body.customerName,
    customerId: body.customerId,
    customerTags: body.customerTags,
    countryCode: body.country,
    deviceType: body.deviceType,
    productId: body.productId,
    productName: body.productName,
    variantIds: body.variantIds,
    collectionId: body.collectionId,
    completionTime: body.completionTime,
    completionRate: body.completionRate,
    endingCardId: body.endingCardId,
    endingCardName: body.endingCardName,
    attributionSource: body.attributionSource,
    pageUrl: body.pageUrl,
    isDiscount: body.isDiscount,
    lineItems: lineItemsFromBody(body),
  };

  return Object.fromEntries(
    Object.entries(ctx).filter(([, value]) => value !== undefined && value !== null),
  ) as SurveySubmissionContext;
}
