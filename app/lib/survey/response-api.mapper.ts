import type { SurveyResponse } from "@prisma/client";
import type {
  SurveyResponseMeta,
  SurveyResponseQuestionDto,
} from "./survey-response.types";

/** Competitor-style list item for admin / future public API. */
export interface SurveyResponseListItemDto {
  id: string;
  shopSequence: number | null;
  shop: string;
  surveyId: string;
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
  productId: string | null;
  productName: string | null;
  variants: unknown[];
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
  row: SurveyResponse,
): SurveyResponseListItemDto {
  const meta = parseMeta(row.meta);
  const questions = parseQuestions(row.questions);

  return {
    id: row.id,
    shopSequence: row.shopSequence,
    shop: row.shop,
    surveyId: row.surveyId,
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
    email: meta.customerEmail ?? null,
    customerName: meta.customerName ?? null,
    customerTags: meta.customerTags ?? [],
    productId: meta.productId ?? null,
    productName: meta.productName ?? null,
    variants: meta.variants ?? [],
    isArchived: row.isArchived,
  };
}

/** Short summary for Polaris table cells. */
export function formatQuestionsSummary(
  questions: SurveyResponseQuestionDto[],
): string {
  return questions
    .map((q) => (q.question ? `${q.question}: ${q.answer}` : q.answer))
    .filter(Boolean)
    .join(" · ");
}
