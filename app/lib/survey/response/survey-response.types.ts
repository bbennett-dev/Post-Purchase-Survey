import type { QuestionType } from "../types";

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
  /** text_image / consent steps */
  booleanAnswer?: boolean | null;
}

/** Competitor-shaped question item stored in `SurveyResponse.questions`. */
export interface SurveyResponseQuestionDto {
  type: string;
  question: string;
  questionId: string;
  answer?: string | number | boolean | null;
  answerId?: string | null;
  image?: string | null;
  answers?: string[];
  answerIds?: string[];
  customAnswer?: string | null;
  images?: (string | null)[];
  fileName?: string | null;
}

/** Nested customer snapshot in `meta` (competitor GET). */
export interface SurveyResponseMetaCustomer {
  id: string;
  name: string;
  email: string;
  tags: string[];
}

/** Variant line stored in `meta.variants`. */
export interface SurveyResponseMetaVariant {
  id: string;
  title: string | null;
  image: string | null;
  product?: {
    id: string;
    title: string;
    featuredImage?: { url: string };
  };
}

/** Optional Shopify / order context stored in `SurveyResponse.meta`. */
export interface SurveyResponseMeta {
  orderName?: string | null;
  displayType?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  customer?: SurveyResponseMetaCustomer | null;
  customerTags?: string[];
  countryCode?: string | null;
  deliveryMethodType?: string | null;
  deliveryMethodTitle?: string | null;
  deviceType?: string | null;
  productId?: string | null;
  productName?: string | null;
  variantIds?: string[];
  variants?: SurveyResponseMetaVariant[];
  isDiscount?: boolean;
  endingCardId?: string | null;
  endingCardName?: string | null;
  abTestId?: string | null;
  variant?: string | null;
  completionTime?: number | null;
  completionRate?: number | null;
  attributionSource?: string | null;
  pageUrl?: string | null;
}

/**
 * Context fields sent with any channel submit (all optional).
 * Merge rule: client POST → Admin enrichment (gaps only) → null.
 */
export interface SurveySubmissionContext {
  pageType?: string | null;
  channelType?: string | null;
  displayType?: string | null;
  orderName?: string | null;
  surveyType?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  customerId?: string | null;
  customerTags?: string[] | null;
  countryCode?: string | null;
  deliveryMethodType?: string | null;
  deliveryMethodTitle?: string | null;
  deviceType?: string | null;
  productId?: string | null;
  productName?: string | null;
  variantIds?: string[] | null;
  collectionId?: string | null;
  endingCardId?: string | null;
  endingCardName?: string | null;
  completionTime?: number | null;
  completionRate?: number | null;
  attributionSource?: string | null;
  pageUrl?: string | null;
  isDiscount?: boolean | null;
  /** Mapped into `meta.variants` when present. */
  lineItems?: SurveySubmissionLineItem[];
}

export interface SurveySubmissionLineItem {
  productId?: string | null;
  productTitle?: string | null;
  variantId?: string | null;
  variantTitle?: string | null;
  featuredImageUrl?: string | null;
  quantity?: number;
}

export interface RecordSurveySubmissionInput {
  shopId: bigint;
  myshopifyDomain: string;
  orderId: string;
  /** Public survey id from checkout POST (`surveyUuid`). */
  surveyUuid: string;
  surveyName: string;
  answers: SurveyResponseAnswerInput[];
  customerId?: string | null;
  context?: SurveySubmissionContext;
  rawPayload?: unknown;
}
