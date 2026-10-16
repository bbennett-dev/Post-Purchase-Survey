import type { Prisma } from "@prisma/client";
import prisma from "../../../db.server";
import type { ShopRecord } from "../../shop/shop.server";
import { enrichSubmissionContext } from "./enrich-submission-context.server";
import { normalizeSurveyResponseQuestions } from "./response-question-normalizer";
import type {
  RecordSurveySubmissionInput,
  SurveyResponseAnswerInput,
  SurveyResponseMeta,
  SurveyResponseMetaVariant,
  SurveySubmissionContext,
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
    const hasCustom = isNonEmptyString(record.customText);
    const hasNumber =
      typeof record.number === "number" && !Number.isNaN(record.number);
    const hasBoolean = typeof record.booleanAnswer === "boolean";
    const hasImage = isNonEmptyString(record.imageUrl);

    if (
      !hasChoice &&
      !hasText &&
      !hasCustom &&
      !hasNumber &&
      !hasBoolean &&
      !hasImage
    ) {
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
      customText: hasCustom ? record.customText!.trim() : null,
      text: hasText ? record.text!.trim() : hasCustom ? record.customText!.trim() : null,
      number: hasNumber ? record.number! : null,
      imageUrl: hasImage ? record.imageUrl : null,
      booleanAnswer: hasBoolean ? record.booleanAnswer! : null,
    });
  }

  return parsed;
}

function contextToMeta(
  context: SurveySubmissionContext | undefined,
  customerId: string | null,
): SurveyResponseMeta | undefined {
  if (!context) {
    return undefined;
  }

  const lineItems = context.lineItems ?? [];
  const firstLine = lineItems[0];
  const variants: SurveyResponseMetaVariant[] | undefined =
    lineItems.length > 0
      ? lineItems.map((item) => ({
          id: item.variantId?.startsWith("gid://")
            ? item.variantId
            : item.variantId
              ? `gid://shopify/ProductVariant/${item.variantId}`
              : "",
          title: item.variantTitle ?? null,
          image: item.featuredImageUrl ?? null,
          product: item.productId
            ? {
                id: item.productId.startsWith("gid://")
                  ? item.productId
                  : `gid://shopify/Product/${item.productId}`,
                title: item.productTitle ?? "",
                featuredImage: item.featuredImageUrl
                  ? { url: item.featuredImageUrl }
                  : undefined,
              }
            : undefined,
        }))
      : undefined;

  const email = context.customerEmail?.trim() || null;
  const name = context.customerName?.trim() || null;
  const numericCustomerId = customerId?.trim() || context.customerId?.trim() || null;

  const customer =
    numericCustomerId || email || name
      ? {
          id: numericCustomerId ?? "",
          name: name ?? "",
          email: email ?? "",
          tags: context.customerTags ?? [],
        }
      : null;

  const meta: SurveyResponseMeta = {
    orderName: context.orderName?.trim() || null,
    displayType: context.displayType?.trim() || null,
    customerEmail: email,
    customerName: name,
    customer,
    customerTags: context.customerTags?.length ? context.customerTags : undefined,
    countryCode: context.countryCode?.trim() || null,
    deliveryMethodType: context.deliveryMethodType?.trim() || null,
    deliveryMethodTitle: context.deliveryMethodTitle?.trim() || null,
    deviceType: context.deviceType?.trim() || null,
    productId: context.productId ?? firstLine?.productId ?? null,
    productName: context.productName ?? firstLine?.productTitle ?? null,
    variantIds: context.variantIds?.length
      ? context.variantIds.map(String)
      : undefined,
    variants: variants?.filter((v) => v.id) as SurveyResponseMetaVariant[] | undefined,
    isDiscount: context.isDiscount ?? undefined,
    endingCardId: context.endingCardId?.trim() || null,
    endingCardName: context.endingCardName?.trim() || null,
    completionTime: context.completionTime ?? null,
    completionRate: context.completionRate ?? null,
    attributionSource: context.attributionSource?.trim() || null,
    pageUrl: context.pageUrl?.trim() || null,
  };

  const hasValue = Object.entries(meta).some(([key, v]) => {
    if (key === "customer" && v && typeof v === "object") {
      const c = v as SurveyResponseMeta["customer"];
      return Boolean(c?.id || c?.email || c?.name);
    }
    return (
      v !== undefined &&
      v !== null &&
      !(Array.isArray(v) && v.length === 0)
    );
  });
  return hasValue ? meta : undefined;
}

/**
 * Stores one submission per shop + order + survey; questions and context as JSON.
 */
export async function recordSurveySubmission(
  input: RecordSurveySubmissionInput,
): Promise<void> {
  const {
    shopId,
    myshopifyDomain,
    orderId,
    surveyUuid,
    surveyName,
    answers,
    customerId: inputCustomerId,
    context: clientContext,
    rawPayload,
  } = input;

  const survey = await prisma.survey.findFirst({
    where: { shopId, surveyUuid },
  });
  if (!survey) {
    throw new Error("Survey not found");
  }

  const enrichedContext = await enrichSubmissionContext(
    myshopifyDomain,
    orderId,
    clientContext,
  );

  const surveyType = enrichedContext.surveyType?.trim() || survey.surveyType;
  const questions = normalizeSurveyResponseQuestions(
    answers,
    survey.document,
  );

  const resolvedCustomerId =
    inputCustomerId?.trim() ||
    enrichedContext.customerId?.trim() ||
    null;

  const meta = contextToMeta(enrichedContext, resolvedCustomerId);
  const email =
    meta?.customerEmail?.trim() ||
    enrichedContext.customerEmail?.trim() ||
    null;

  const rowData = {
    shopId,
    surveyId: survey.id,
    surveyName,
    surveyType,
    orderId,
    customerId: resolvedCustomerId,
    email,
    pageType: enrichedContext.pageType?.trim() || null,
    channelType: enrichedContext.channelType?.trim() || null,
    questions: questions as unknown as Prisma.InputJsonValue,
    meta: meta ? (meta as unknown as Prisma.InputJsonValue) : undefined,
    payload: rawPayload ? (rawPayload as Prisma.InputJsonValue) : undefined,
    submittedAt: new Date(),
  };

  await prisma.$transaction(async (tx) => {
    const existing = await tx.surveyResponse.findUnique({
      where: {
        shopId_orderId_surveyId: {
          shopId,
          orderId,
          surveyId: survey.id,
        },
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
      where: { shopId },
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
      where: { id: survey.id },
      data: { responseCount: { increment: 1 } },
    });
  });
}

/** Legacy single-answer + multi-answer POST body. */
export async function recordSurveyResponseFromBody(input: {
  shop: ShopRecord;
  orderId: string;
  surveyUuid: string;
  surveyName: string;
  customerId?: string | null;
  answers?: unknown;
  answerId?: string;
  answerLabel?: string;
  customText?: string | null;
  context?: SurveySubmissionContext;
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
    shopId: input.shop.shopId,
    myshopifyDomain: input.shop.myshopifyDomain,
    orderId: input.orderId,
    surveyUuid: input.surveyUuid,
    surveyName: input.surveyName,
    answers,
    customerId: input.customerId,
    context: input.context,
    rawPayload: input.rawPayload,
  });
}

/** Paginated responses for admin / API mapper. */
export async function listSurveyResponsesForShop(
  shop: ShopRecord,
  options: { take: number; skip: number },
) {
  return prisma.surveyResponse.findMany({
    where: { shopId: shop.shopId, isArchived: false },
    orderBy: { submittedAt: "desc" },
    take: options.take,
    skip: options.skip,
    include: {
      survey: { select: { surveyUuid: true } },
      shop: { select: { myshopifyDomain: true, shopUuid: true } },
    },
  });
}

export async function countSurveyResponsesForShop(
  shop: ShopRecord,
): Promise<number> {
  return prisma.surveyResponse.count({
    where: { shopId: shop.shopId, isArchived: false },
  });
}

/** @deprecated use formatQuestionsSummary from response-api.mapper */
export function formatAnswersSummary(
  questions: { question?: string; answer?: unknown }[],
): string {
  return questions
    .map((q) => {
      const ans =
        q.answer === null || q.answer === undefined ? "" : String(q.answer);
      return q.question ? `${q.question}: ${ans}` : ans;
    })
    .filter(Boolean)
    .join(" · ");
}
