import type { Prisma } from "@prisma/client";
import type {
  SurveyResponseMeta,
  SurveyResponseMetaVariant,
  SurveyResponseQuestionDto,
} from "./survey-response.types";

/** Row shape from listSurveyResponsesForShop include. */
export type SurveyResponseListRow = Prisma.SurveyResponseGetPayload<{
  include: {
    survey: { select: { surveyUuid: true } };
    shop: { select: { myshopifyDomain: true; shopUuid: true } };
  };
}>;

/** Competitor-style list item for admin / future public API. */
export interface SurveyResponseListItemDto {
  id: string;
  shopSequence: number | null;
  shopUuid: string;
  myshopifyDomain: string;
  surveyUuid: string;
  surveyName: string;
  surveyType: string;
  questions: SurveyResponseQuestionDto[];
  createdAt: string;
  submittedAt: string;
  pageType: string | null;
  channelType: string | null;
  displayType: string | null;
  orderId: string;
  orderName: string | null;
  customerId: string | null;
  email: string | null;
  customerName: string | null;
  customerTags: string[];
  customer: SurveyResponseMeta["customer"] | null;
  productId: string | null;
  productName: string | null;
  country: string | null;
  deviceType: string | null;
  deliveryMethodType: string | null;
  deliveryMethodTitle: string | null;
  endingCardId: string | null;
  completionTime: number | null;
  variants: SurveyResponseMetaVariant[];
  isArchived: boolean;
}

function parseMeta(value: unknown): SurveyResponseMeta {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as SurveyResponseMeta;
}

function parseQuestions(value: unknown): SurveyResponseQuestionDto[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is SurveyResponseQuestionDto =>
      !!item &&
      typeof item === "object" &&
      typeof (item as SurveyResponseQuestionDto).questionId === "string",
  );
}

export function mapSurveyResponseToListItem(
  row: SurveyResponseListRow,
): SurveyResponseListItemDto {
  const meta = parseMeta(row.meta);
  const questions = parseQuestions(row.questions);
  const email = row.email ?? meta.customerEmail ?? null;

  return {
    id: row.responseUuid,
    shopSequence: row.shopSequence,
    shopUuid: row.shop.shopUuid,
    myshopifyDomain: row.shop.myshopifyDomain,
    surveyUuid: row.survey.surveyUuid,
    surveyName: row.surveyName,
    surveyType: row.surveyType,
    questions,
    createdAt: row.createdAt.toISOString(),
    submittedAt: row.submittedAt.toISOString(),
    pageType: row.pageType,
    channelType: row.channelType,
    displayType: meta.displayType ?? null,
    orderId: row.orderId,
    orderName: meta.orderName ?? null,
    customerId: row.customerId,
    email,
    customerName: meta.customerName ?? meta.customer?.name ?? null,
    customerTags: meta.customerTags ?? meta.customer?.tags ?? [],
    customer: meta.customer ?? null,
    productId: meta.productId ?? null,
    productName: meta.productName ?? null,
    country: meta.countryCode ?? null,
    deviceType: meta.deviceType ?? null,
    deliveryMethodType: meta.deliveryMethodType ?? null,
    deliveryMethodTitle: meta.deliveryMethodTitle ?? null,
    endingCardId: meta.endingCardId ?? null,
    completionTime: meta.completionTime ?? null,
    variants: meta.variants ?? [],
    isArchived: row.isArchived,
  };
}

/** Short summary for Polaris table cells. */
export function formatQuestionsSummary(
  questions: SurveyResponseQuestionDto[],
): string {
  return questions
    .map((q) => {
      const ans =
        q.answer === null || q.answer === undefined
          ? q.answers?.join(", ") ?? ""
          : String(q.answer);
      return q.question ? `${q.question}: ${ans}` : ans;
    })
    .filter(Boolean)
    .join(" · ");
}
