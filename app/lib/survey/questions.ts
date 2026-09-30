import sampleSurvey from "./sample-survey.json";
import type {
  QuestionType,
  SurveyDocument,
  SurveyQuestion,
  ThankYouContent,
} from "./types";

export const QUESTION_TYPES: {
  type: QuestionType;
  label: string;
  icon:
    | "circle"
    | "checkbox"
    | "hashtag"
    | "star"
    | "smiley-happy"
    | "text"
    | "calendar"
    | "email"
    | "image";
}[] = [
  { type: "single", label: "Single choice", icon: "circle" },
  { type: "multiple", label: "Multiple choice", icon: "checkbox" },
  { type: "number_scale", label: "Number scale", icon: "hashtag" },
  { type: "star_rating", label: "Star rating", icon: "star" },
  { type: "satisfaction", label: "Satisfaction", icon: "smiley-happy" },
  { type: "short_answer", label: "Short answer", icon: "text" },
  { type: "date", label: "Date", icon: "calendar" },
  { type: "consent_email", label: "Consent email", icon: "email" },
  { type: "text_image", label: "Text & Image", icon: "image" },
];

export const CHANNEL_LABELS: Record<string, string> = {
  dedicatedPageSurvey: "Dedicated page",
  siteWidget: "Site widget",
  postPurchasePage: "Thank you page",
  postPurchaseEmail: "Post-purchase email",
  exitIntent: "Exit intent",
  embedSurvey: "Embed survey",
  embedEmail: "Embed email",
  surveyForm: "Popup form",
  posPage: "Point of sale",
};

const CHOICE_TYPES = new Set<QuestionType>(["single", "multiple"]);
const SCALE_TYPES = new Set<QuestionType>([
  "number_scale",
  "star_rating",
  "satisfaction",
]);

/** Fresh copy of the sample survey so edits stay in memory. */
export function createSampleSurvey(): SurveyDocument {
  return structuredClone(sampleSurvey) as SurveyDocument;
}

export function questionLabel(type: QuestionType): string {
  return QUESTION_TYPES.find((item) => item.type === type)?.label ?? type;
}

export function questionIcon(type: QuestionType) {
  return QUESTION_TYPES.find((item) => item.type === type)?.icon ?? "circle";
}

function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

/**
 * Builds a question with the fields that type uses in the sample document.
 * Upload is omitted because the sample has no upload question.
 */
export function createQuestion(
  type: QuestionType,
  position: number,
): SurveyQuestion {
  const question: SurveyQuestion = {
    id: nextId("question"),
    type,
    heading: "Untitled question",
    description: "",
    skippable: false,
    position,
    sectionId: null,
    positionInSection: null,
    image: { url: "", alignment: "center", sizePercentage: 100 },
  };

  if (CHOICE_TYPES.has(type)) {
    const stamp = Date.now();
    question.answers = [
      { id: `answer_${stamp}_0`, content: "Option 1" },
      { id: `answer_${stamp}_1`, content: "Option 2" },
    ];
    question.enabledCustomAnswer = false;
    question.showWhen = "always_show";
    question.showCustomAnswerWhen = [];
    question.customAnswerPlaceholder = "Please add more information";
    question.customAnswerRequired = false;
    question.shuffleAnswer = false;
  }

  if (SCALE_TYPES.has(type)) {
    question.leftLabel = "Low";
    question.rightLabel = "High";
  }

  if (type === "short_answer") {
    question.placeholder = "";
  }

  if (type === "date") {
    question.dateFormat = "MM/d/YYYY";
    question.maxDateIsCurrentDay = false;
  }

  if (type === "consent_email") {
    question.agreeDescriptionEmail = "I agree";
    question.showCustomerAlready = false;
  }

  return question;
}

export function withPositions(questions: SurveyQuestion[]): SurveyQuestion[] {
  return questions.map((question, position) => ({ ...question, position }));
}

/**
 * Moves a question to another question's place and rewrites position.
 */
export function moveQuestion(
  questions: SurveyQuestion[],
  fromId: string,
  toId: string,
): SurveyQuestion[] {
  if (fromId === toId) {
    return questions;
  }

  const from = questions.findIndex((question) => question.id === fromId);
  const to = questions.findIndex((question) => question.id === toId);
  if (from < 0 || to < 0) {
    return questions;
  }

  const next = [...questions];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return withPositions(next);
}

/**
 * Applies a full id order to the question list after a drag preview.
 */
export function applyQuestionOrder(
  questions: SurveyQuestion[],
  order: string[],
): SurveyQuestion[] {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const next = order.flatMap((id) => {
    const question = byId.get(id);
    return question ? [question] : [];
  });
  return withPositions(next);
}

/**
 * Changes the question type and keeps the shared fields.
 * Type-specific fields are filled when the new type needs them.
 */
export function changeQuestionType(
  question: SurveyQuestion,
  type: QuestionType,
): SurveyQuestion {
  const next = createQuestion(type, question.position);
  return {
    ...next,
    id: question.id,
    heading: question.heading,
    description: question.description,
    skippable: question.skippable,
    sectionId: question.sectionId,
    positionInSection: question.positionInSection,
    image: question.image ?? next.image,
  };
}

export function createEnding(): ThankYouContent {
  return {
    type: "thank_you",
    thankYouType: "default",
    id: nextId("card"),
    isDefault: false,
    name: "Untitled ending",
    heading: "Untitled ending",
    description: "",
    link: "",
    enableButton: false,
    buttonText: "Continue",
    buttonLink: "",
    closingText: "Closing in {seconds}s",
    unlockedText: "You unlocked",
    copyText: "Copy",
    copiedText: "Copied!",
    discountCodeLabel: "Your discount code",
  };
}

export function endingTitle(card: ThankYouContent, index: number): string {
  if (card.name && card.name.trim().length > 0) {
    return card.name;
  }
  if (card.isDefault) {
    return card.heading || "Thank you";
  }
  return card.heading || `Ending ${index + 1}`;
}
