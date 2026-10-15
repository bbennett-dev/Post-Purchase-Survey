import type { Prisma } from "@prisma/client";
import prisma from "../../db.server";
import type {
  RecordSurveySubmissionInput,
  SurveyResponseAnswerInput,
  SurveyResponseMeta,
  SurveyResponseQuestionDto,
} from "./survey-response.types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Validates checkout payload answers before persistence. */
export function parseSurveyResponseAnswers(
  raw: unknown,
): SurveyResponseAnswerInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  const parsed: SurveyResponseAnswerInput[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const record = item as SurveyResponseAnswerInput;
    if (!isNonEmptyString(record.questionId)) {
      return null;
    }

    const hasChoice =
      Array.isArray(record.answerIds) && record.answerIds.length > 0;
    const hasText = isNonEmptyString(record.text);
    const hasNumber =
      typeof record.number === "number" && !Number.isNaN(record.number);

    if (!hasChoice && !hasText && !hasNumber) {
      return null;
    }

    parsed.push({
      questionId: record.questionId.trim(),
      questionType: record.questionType ?? "single",
      questionHeading: record.questionHeading,
      answerIds: hasChoice ? record.answerIds!.map(String) : undefined,
      answerLabels: Array.isArray(record.answerLabels)
        ? record.answerLabels.map(String)
        : undefined,
      customText: isNonEmptyString(record.customText)
        ? record.customText.trim()
        : null,
      text: hasText ? record.text!.trim() : null,
      number: hasNumber ? record.number! : null,
      imageUrl: isNonEmptyString(record.imageUrl) ? record.imageUrl : null,
    });
  }

  return parsed;
}

function primaryAnswerFields(answer: SurveyResponseAnswerInput): {
  answerId: string | null;
  answerText: string;
} {
  if (answer.answerLabels?.length) {
    return {
      answerId: answer.answerIds?.[0] ?? null,
      answerText: answer.answerLabels.join(", "),
    };
  }
  if (answer.text) {
    return { answerId: null, answerText: answer.text };
  }
  if (typeof answer.number === "number") {
    return { answerId: null, answerText: String(answer.number) };
  }
  if (answer.customText) {
    return { answerId: answer.answerIds?.[0] ?? null, answerText: answer.customText };
  }
  return { answerId: answer.answerIds?.[0] ?? null, answerText: "" };
}

function answersToStoredQuestions(
  answers: SurveyResponseAnswerInput[],
): SurveyResponseQuestionDto[] {
  return answers.map((answer, index) => {
    const { answerId, answerText } = primaryAnswerFields(answer);
    return {
      type: String(answer.questionType),
      question: answer.questionHeading?.trim() || `Question ${index + 1}`,
      questionId: answer.questionId,
      answer: answerText,
      answerId,
      image: answer.imageUrl ?? null,
    };
  });
}

function contextToMeta(
  context: RecordSurveySubmissionInput["context"],
): SurveyResponseMeta | undefined {
  if (!context) {
    return undefined;
  }

  const lineItems = context.lineItems ?? [];
  const firstLine = lineItems[0];
  const variants =
    lineItems.length > 0
      ? lineItems.map((item) => ({
          id: item.variantId,
          title: item.variantTitle,
          image: item.featuredImageUrl,
          product: item.productId
            ? {
                id: item.productId,
                title: item.productTitle,
                featuredImage: item.featuredImageUrl
                  ? { url: item.featuredImageUrl }
                  : undefined,
              }
            : undefined,
        }))
      : undefined;

  const meta: SurveyResponseMeta = {
    orderName: context.orderName?.trim() || null,
    displayType: context.displayType?.trim() || null,
    customerEmail: context.customerEmail?.trim() || null,
    customerName: context.customerName?.trim() || null,
    customerTags: context.customerTags?.length ? context.customerTags : undefined,
    countryCode: context.countryCode?.trim() || null,
    deliveryMethodType: context.deliveryMethodType?.trim() || null,
    deliveryMethodTitle: context.deliveryMethodTitle?.trim() || null,
    deviceType: context.deviceType?.trim() || null,
    productId: firstLine?.productId ?? null,
    productName: firstLine?.productTitle ?? null,
    variants,
  };

  const hasValue = Object.values(meta).some(
    (v) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0),
  );
  return hasValue ? meta : undefined;
}

/**
 * Stores one submission per shop + order + survey; questions and context as JSON.
 */
export async function recordSurveySubmission(
  input: RecordSurveySubmissionInput,
): Promise<void> {
  const {
    shop,
    orderId,
    surveyId,
    surveyName,
    answers,
    customerId,
    context,
    rawPayload,
  } = input;

  const survey = await prisma.survey.findFirst({
    where: { shop, id: surveyId },
  });
  if (!survey) {
    throw new Error("Survey not found");
  }

  const surveyType = context?.surveyType?.trim() || survey.surveyType;
  const questions = answersToStoredQuestions(answers);
  const meta = contextToMeta(context);

  const rowData = {
    shop,
    surveyId,
    surveyName,
    surveyType,
    orderId,
    customerId: customerId ?? null,
    pageType: context?.pageType?.trim() || null,
    channelType: context?.channelType?.trim() || null,
    questions: questions as unknown as Prisma.InputJsonValue,
    meta: meta ? (meta as unknown as Prisma.InputJsonValue) : undefined,
    payload: rawPayload ? (rawPayload as Prisma.InputJsonValue) : undefined,
    submittedAt: new Date(),
  };

  await prisma.$transaction(async (tx) => {
    const existing = await tx.surveyResponse.findUnique({
      where: {
        shop_orderId_surveyId: { shop, orderId, surveyId },
      },
    });

    if (existing) {
      await tx.surveyResponse.update({
        where: { id: existing.id },
        data: rowData,
      });
      return;
    }

    const agg = await tx.surveyResponse.aggregate({
      where: { shop },
      _max: { shopSequence: true },
    });
    const shopSequence = (agg._max.shopSequence ?? 0) + 1;
    await tx.surveyResponse.create({
      data: {
        ...rowData,
        shopSequence,
      },
    });
    await tx.survey.update({
      where: { id: surveyId },
      data: { responseCount: { increment: 1 } },
    });
  });
}

/** Legacy single-answer + multi-answer POST body. */
export async function recordSurveyResponseFromBody(input: {
  shop: string;
  orderId: string;
  surveyId: string;
  surveyName: string;
  customerId?: string | null;
  answers?: unknown;
  answerId?: string;
  answerLabel?: string;
  customText?: string | null;
  context?: RecordSurveySubmissionInput["context"];
  rawPayload?: unknown;
}): Promise<void> {
  let answers = parseSurveyResponseAnswers(input.answers);
  if (!answers && input.answerId && input.answerLabel) {
    answers = [
      {
        questionId: "legacy",
        questionType: "single",
        answerIds: [input.answerId],
        answerLabels: [input.answerLabel],
        customText: input.customText,
      },
    ];
  }
  if (!answers) {
    throw new Error("Invalid answers payload");
  }

  return recordSurveySubmission({
    shop: input.shop,
    orderId: input.orderId,
    surveyId: input.surveyId,
    surveyName: input.surveyName,
    answers,
    customerId: input.customerId,
    context: input.context,
    rawPayload: input.rawPayload,
  });
}

/** Paginated responses for admin / API mapper. */
export async function listSurveyResponsesForShop(
  shop: string,
  options: { take: number; skip: number },
) {
  return prisma.surveyResponse.findMany({
    where: { shop, isArchived: false },
    orderBy: { submittedAt: "desc" },
    take: options.take,
    skip: options.skip,
  });
}

export async function countSurveyResponsesForShop(shop: string): Promise<number> {
  return prisma.surveyResponse.count({
    where: { shop, isArchived: false },
  });
}

/** @deprecated use formatQuestionsSummary from response-api.mapper */
export function formatAnswersSummary(
  questions: { question?: string; answer: string }[],
): string {
  return questions
    .map((q) => (q.question ? `${q.question}: ${q.answer}` : q.answer))
    .filter(Boolean)
    .join(" · ");
}
