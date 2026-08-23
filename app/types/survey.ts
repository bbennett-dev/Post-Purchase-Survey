export const SURVEY_SOURCES = ["thank_you", "order_status"] as const;

export type SurveySource = (typeof SURVEY_SOURCES)[number];

export interface SurveyOptionDto {
  id: string;
  label: string;
  position: number;
  isOther: boolean;
  isActive: boolean;
}

export interface SurveyConfigDto {
  id: string;
  shop: string;
  heading: string;
  isEnabled: boolean;
  allowOther: boolean;
  options: SurveyOptionDto[];
}

export interface PublicSurveyOptionDto {
  id: string;
  label: string;
  isOther: boolean;
}

export interface PublicSurveyGetResponse {
  heading: string;
  isEnabled: boolean;
  allowOther: boolean;
  alreadySubmitted: boolean;
  options: PublicSurveyOptionDto[];
}

export interface SurveySubmitRequest {
  shopifyOrderGid: string;
  shopifyOrderNumber?: string | null;
  shopifyCustomerGid?: string | null;
  checkoutToken?: string | null;
  optionIds: string[];
  otherText?: string | null;
  source: SurveySource;
}

export interface SurveySubmitResponse {
  ok: true;
  alreadySubmitted: boolean;
}

export interface AdminSurveyOptionInput {
  id?: string;
  label: string;
  isActive: boolean;
  isOther: boolean;
}

export interface AdminSurveySaveRequest {
  heading: string;
  isEnabled: boolean;
  allowOther: boolean;
  options: AdminSurveyOptionInput[];
}

export const DEFAULT_SURVEY_HEADING = "How did you hear about us?";

export const DEFAULT_SURVEY_OPTIONS: ReadonlyArray<{
  label: string;
  isOther: boolean;
}> = [
  { label: "Instagram", isOther: false },
  { label: "Facebook", isOther: false },
  { label: "TikTok", isOther: false },
  { label: "Google", isOther: false },
  { label: "YouTube", isOther: false },
  { label: "Podcast", isOther: false },
  { label: "Friend / family", isOther: false },
  { label: "Other", isOther: true },
];

export const OTHER_TEXT_MAX_LENGTH = 500;
export const OPTION_LABEL_MAX_LENGTH = 80;
export const HEADING_MAX_LENGTH = 120;
