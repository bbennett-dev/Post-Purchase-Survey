/**
 * Survey document stored by the editor.
 * Field names match the get-survey-by-id response so a later save can send
 * the same object the backend already returns.
 */

export type QuestionType =
  | "single"
  | "multiple"
  | "number_scale"
  | "star_rating"
  | "satisfaction"
  | "short_answer"
  | "date"
  | "email"
  | "consent_email"
  | "text_image";

export type ImageAlignment = "left" | "center" | "right";

/** How choice answers render in checkout (stored on the question document). */
export type ChoiceAnswerLayout = "text_only" | "text_with_image";

/** Short answer validation format (checkout input rules). */
export type ShortAnswerFormat = "any_text" | "numbers_only";

/** When the optional “other” / custom answer field is shown. */
export type CustomAnswerShowWhen =
  | "always_show"
  | "when_customer_select_answers";

export interface SurveyAnswer {
  id: string;
  content: string;
}

export interface SurveyImage {
  url: string;
  alignment: ImageAlignment;
  sizePercentage: number | string;
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  heading: string;
  description?: string;
  skippable: boolean;
  position: number;
  sectionId: string | null;
  positionInSection?: number | null;
  image?: SurveyImage;
  answers?: SurveyAnswer[];
  enabledCustomAnswer?: boolean;
  showWhen?: CustomAnswerShowWhen;
  showCustomAnswerWhen?: string[];
  customAnswerPlaceholder?: string;
  customAnswerRequired?: boolean;
  shuffleAnswer?: boolean;
  answerLayout?: ChoiceAnswerLayout;
  leftLabel?: string;
  rightLabel?: string;
  placeholder?: string;
  /** Short answer: optional input validation (competitor “Answer validation”). */
  enabledAnswerValidation?: boolean;
  answerFormat?: ShortAnswerFormat;
  minCharacters?: number;
  maxCharacters?: number;
  dateFormat?: string;
  minDate?: string;
  maxDate?: string;
  maxDateIsCurrentDay?: boolean;
  agreeDescriptionEmail?: string;
  showCustomerAlready?: boolean;
}

export interface ThankYouContent {
  type: "thank_you";
  thankYouType: string;
  heading: string;
  description: string;
  link: string;
  enableButton: boolean;
  buttonText: string;
  buttonLink: string;
  closingText: string;
  unlockedText: string;
  copyText: string;
  copiedText: string;
  discountCodeLabel: string;
  id?: string;
  isDefault?: boolean;
  name?: string;
}

export interface SurveyChannel {
  type?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export type SegmentConditionField = "user_tag";

export type SegmentConditionOperator = "include" | "exclude";

export interface SurveyCustomerSegmentCondition {
  field: SegmentConditionField;
  operator: SegmentConditionOperator;
  tags: string[];
}

/** Merchant-defined segment group (Thank you page user targeting). */
export interface SurveyCustomerSegmentGroup {
  id: string;
  name: string;
  condition: SurveyCustomerSegmentCondition;
  enabled?: boolean;
}

export type DedicatedPageBackgroundType = "solid" | "gradient" | "image";

/** Branded survey page channel (`dedicatedPageSurvey`). */
export interface DedicatedPageSurveyChannel extends SurveyChannel {
  type?: "dedicatedPageSurvey";
  link?: string;
  allowMultiSubmit?: boolean;
  enabledHeaderLogo?: boolean;
  enabledSideLogo?: boolean;
  headerLogo?: {
    url?: string;
    alignment?: string;
    enabled?: boolean;
  };
  sideLogo?: {
    url?: string;
    enabled?: boolean;
  };
  button?: {
    color?: string;
    backgroundColor?: string;
    backgroundHover?: string;
  };
  section?: {
    primaryTextColor?: string;
    secondaryTextColor?: string;
    accentColor?: string;
    backgroundColor?: string;
  };
  enabledSectionBackground?: boolean;
  background?: {
    type?: DedicatedPageBackgroundType;
    colorSolid?: string;
    gradientStart?: string;
    gradientEnd?: string;
    gradientDirection?: number;
    image?: {
      url?: string;
    };
  };
  enabledCustomCss?: boolean;
  customCss?: string;
}

/** Shared settings for Thank you + Order status (`postPurchasePage`). */
export interface PostPurchasePageChannel extends SurveyChannel {
  type?: "postPurchasePage";
  displayType?: string;
  announcementBar?: {
    modalTitle?: string;
    content?: string;
    buttonText?: string;
  };
  userTargeting?: {
    type?: "all_users" | "segment";
    /** Segment mode: return buyers (locked on in competitor UI). */
    returnCustomer?: boolean;
    newCustomer?: boolean;
    customerSegment?: SurveyCustomerSegmentGroup[];
  };
  widgetRecurrence?: string;
  enabledSideLogo?: boolean;
  sideLogo?: {
    url?: string;
    enabled?: boolean;
  };
}

export interface SurveyDiscountCard {
  heading?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

export interface SurveyDiscountBanner {
  heading?: string;
  description?: string;
}

/** Which discount surface is selected for preview / right-panel editing. */
export type DiscountPreviewTarget = "banner" | "thankYouCard";

export interface SurveyDiscount {
  enabled: boolean;
  code?: string;
  displayText?: string;
  /** Where the code is shown after completion (competitor “Display discount code on”). */
  displayOn?: string;
  discountType?: string;
  card?: SurveyDiscountCard;
  banner?: SurveyDiscountBanner;
  [key: string]: unknown;
}

/** Full survey record, including channels the Content tab does not edit yet. */
export interface SurveyDocument {
  id?: string;
  name: string;
  isActive: boolean;
  surveyType: string;
  templateType: string;
  advancedLogicEnabled: boolean;
  sections: unknown[];
  questions: SurveyQuestion[];
  thankYou: ThankYouContent;
  thankYouCards: ThankYouContent[];
  channels: Record<string, SurveyChannel>;
  channelTypes: string[];
  discount: SurveyDiscount;
  translation: Record<string, unknown>;
  shopId?: string;
  totalResponses?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type EditorWorkspace = "build" | "logic";
export type EditorPanel = "content" | "channel" | "discount";
export type PreviewDevice = "desktop" | "mobile" | "fullscreen";
