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
  | "consent_email"
  | "text_image";

export type ImageAlignment = "left" | "center" | "right";

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
  showWhen?: string;
  showCustomAnswerWhen?: string[];
  customAnswerPlaceholder?: string;
  customAnswerRequired?: boolean;
  shuffleAnswer?: boolean;
  leftLabel?: string;
  rightLabel?: string;
  placeholder?: string;
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

export interface SurveyDiscount {
  enabled: boolean;
  code?: string;
  displayText?: string;
  discountType?: string;
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
