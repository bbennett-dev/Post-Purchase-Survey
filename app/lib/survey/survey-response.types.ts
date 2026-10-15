import type { QuestionType } from "./types";

/** Payload answer item from checkout extension POST. */
export interface SurveyResponseAnswerInput {
  questionId: string;
  questionType: QuestionType | string;
  questionHeading?: string;
  answerIds?: string[];
  answerLabels?: string[];
  customText?: string | null;
  text?: string | null;
  number?: number | null;
  imageUrl?: string | null;
}

/** Competitor-shaped question item stored in `SurveyResponse.questions`. */
export interface SurveyResponseQuestionDto {
  type: string;
  question: string;
  questionId: string;
  answer: string;
  answerId: string | null;
  image: string | null;
}

/** Optional Shopify / order context stored in `SurveyResponse.meta`. */
export interface SurveyResponseMeta {
  orderName?: string | null;
  displayType?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  customerTags?: string[];
  countryCode?: string | null;
  deliveryMethodType?: string | null;
  deliveryMethodTitle?: string | null;
  deviceType?: string | null;
  productId?: string | null;
  productName?: string | null;
  variants?: unknown[];
  isDiscount?: boolean;
  endingCardId?: string | null;
  endingCardName?: string | null;
  abTestId?: string | null;
  variant?: string | null;
}

/** Context fields sent with checkout submit (optional v1). */
export interface SurveySubmissionContext {
  pageType?: string | null;
  channelType?: string | null;
  displayType?: string | null;
  orderName?: string | null;
  surveyType?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  customerTags?: string[] | null;
  countryCode?: string | null;
  deliveryMethodType?: string | null;
  deliveryMethodTitle?: string | null;
  deviceType?: string | null;
  /** Mapped into `meta.variants` when present. */
  lineItems?: {
    productId?: string | null;
    productTitle?: string | null;
    variantId?: string | null;
    variantTitle?: string | null;
    featuredImageUrl?: string | null;
    quantity?: number;
  }[];
}

export interface RecordSurveySubmissionInput {
  shop: string;
  orderId: string;
  surveyId: string;
  surveyName: string;
  answers: SurveyResponseAnswerInput[];
  customerId?: string | null;
  context?: SurveySubmissionContext;
  rawPayload?: unknown;
}
