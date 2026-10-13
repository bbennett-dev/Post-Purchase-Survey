import sampleSurvey from "./sample-survey.json";
import type {
  QuestionType,
  SurveyDocument,
  SurveyQuestion,
  ThankYouContent,
} from "./types";

export const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
  { type: "single", label: "Single choice" },
  { type: "multiple", label: "Multiple choice" },
  { type: "number_scale", label: "Number scale" },
  { type: "star_rating", label: "Star rating" },
  { type: "satisfaction", label: "Satisfaction" },
  { type: "short_answer", label: "Short answer" },
  { type: "date", label: "Date" },
  { type: "consent_email", label: "Consent email" },
  { type: "text_image", label: "Text & Image" },
  { type: "email", label: "Email" },
];

export { CHANNEL_LABELS } from "./channels";

const CHOICE_TYPES = new Set<QuestionType>(["single", "multiple"]);
const SCALE_TYPES = new Set<QuestionType>([
  "number_scale",
  "star_rating",
  "satisfaction",
]);

/** Default endpoint copy for scale-style questions (competitor references). */
export function scaleEndpointLabels(type: QuestionType): {
  leftLabel: string;
  rightLabel: string;
} {
  switch (type) {
    case "number_scale":
      return { leftLabel: "Not likely", rightLabel: "Very likely" };
    case "star_rating":
      return { leftLabel: "Hate it", rightLabel: "Love it" };
    case "satisfaction":
      return { leftLabel: "Not satisfied", rightLabel: "Very satisfied" };
    default:
      return { leftLabel: "Low", rightLabel: "High" };
  }
}

/** Fresh copy of the sample survey so edits stay in memory. */
export function createSampleSurvey(): SurveyDocument {
  return structuredClone(sampleSurvey) as SurveyDocument;
}

export function questionLabel(type: QuestionType): string {
  return QUESTION_TYPES.find((item) => item.type === type)?.label ?? type;
}

function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

/** Default heading for a new question at `position` (0-based index in the survey). */
export function defaultQuestionHeading(position: number): string {
  return `Question #${position + 1}`;
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
    heading: defaultQuestionHeading(position),
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
    question.answerLayout = "text_only";
  }

  if (SCALE_TYPES.has(type)) {
    const endpoints = scaleEndpointLabels(type);
    question.leftLabel = endpoints.leftLabel;
    question.rightLabel = endpoints.rightLabel;
  }

  if (type === "short_answer") {
    question.placeholder = "Please add more information";
    question.enabledAnswerValidation = false;
    question.answerFormat = "any_text";
  }

  if (type === "date") {
    question.dateFormat = "DD/MM/YYYY";
    question.maxDateIsCurrentDay = false;
  }

  if (type === "email") {
    question.placeholder = "";
  }

  if (type === "consent_email") {
    question.skippable = true;
    question.description =
      'By selecting "I agree", you have agreed to receive emails from our stores following to Privacy Policy of Shopify.';
    question.agreeDescriptionEmail = "I agree";
    question.showCustomerAlready = false;
  }

  if (type === "text_image") {
    question.skippable = true;
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

/** Single and multiple choice share the same document fields and inspector. */
export function isChoiceQuestionType(type: QuestionType): boolean {
  return CHOICE_TYPES.has(type);
}

/**
 * Ensures every choice question has the same optional fields as single choice
 * (for older API payloads that omit keys on multiple choice).
 */
export function withChoiceQuestionDefaults(
  question: SurveyQuestion,
): SurveyQuestion {
  if (!CHOICE_TYPES.has(question.type)) {
    return question;
  }

  const defaults = createQuestion(question.type, question.position);
  return {
    ...question,
    answers: question.answers?.length ? question.answers : defaults.answers,
    enabledCustomAnswer:
      question.enabledCustomAnswer ?? defaults.enabledCustomAnswer,
    showWhen: question.showWhen ?? defaults.showWhen,
    showCustomAnswerWhen:
      question.showCustomAnswerWhen ?? defaults.showCustomAnswerWhen,
    customAnswerPlaceholder:
      question.customAnswerPlaceholder ?? defaults.customAnswerPlaceholder,
    customAnswerRequired:
      question.customAnswerRequired ?? defaults.customAnswerRequired,
    shuffleAnswer: question.shuffleAnswer ?? defaults.shuffleAnswer,
    answerLayout: question.answerLayout ?? defaults.answerLayout,
  };
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
  let merged: SurveyQuestion = {
    ...next,
    id: question.id,
    heading: question.heading,
    description: question.description,
    skippable: question.skippable,
    sectionId: question.sectionId,
    positionInSection: question.positionInSection,
    image: question.image ?? next.image,
  };

  if (SCALE_TYPES.has(type) && SCALE_TYPES.has(question.type)) {
    merged = {
      ...merged,
      leftLabel: question.leftLabel ?? merged.leftLabel,
      rightLabel: question.rightLabel ?? merged.rightLabel,
    };
  }

  if (type === "date" && question.type === "date") {
    merged = {
      ...merged,
      dateFormat: question.dateFormat ?? merged.dateFormat,
      minDate: question.minDate,
      maxDate: question.maxDate,
      maxDateIsCurrentDay:
        question.maxDateIsCurrentDay ?? merged.maxDateIsCurrentDay,
    };
  }

  if (
    (type === "short_answer" || type === "email") &&
    (question.type === "short_answer" || question.type === "email")
  ) {
    merged = {
      ...merged,
      placeholder: question.placeholder ?? merged.placeholder,
    };
  }

  if (type === "email") {
    merged = {
      ...merged,
      placeholder: question.placeholder ?? merged.placeholder ?? "",
    };
  }

  if (type === "short_answer" && question.type === "short_answer") {
    merged = {
      ...merged,
      placeholder: question.placeholder ?? merged.placeholder,
      enabledAnswerValidation:
        question.enabledAnswerValidation ?? merged.enabledAnswerValidation,
      answerFormat: question.answerFormat ?? merged.answerFormat,
      minCharacters: question.minCharacters,
      maxCharacters: question.maxCharacters,
    };
  }

  if (type === "consent_email") {
    merged = {
      ...merged,
      skippable: true,
      agreeDescriptionEmail:
        question.agreeDescriptionEmail ?? merged.agreeDescriptionEmail,
      showCustomerAlready:
        question.showCustomerAlready ?? merged.showCustomerAlready,
    };
  }

  if (type === "text_image") {
    merged = {
      ...merged,
      skippable: true,
    };
  }

  if (CHOICE_TYPES.has(type) && CHOICE_TYPES.has(question.type)) {
    merged = {
      ...merged,
      answers: question.answers?.length ? question.answers : merged.answers,
      enabledCustomAnswer: question.enabledCustomAnswer ?? merged.enabledCustomAnswer,
      showWhen: question.showWhen ?? merged.showWhen,
      showCustomAnswerWhen:
        question.showCustomAnswerWhen ?? merged.showCustomAnswerWhen,
      customAnswerPlaceholder:
        question.customAnswerPlaceholder ?? merged.customAnswerPlaceholder,
      customAnswerRequired:
        question.customAnswerRequired ?? merged.customAnswerRequired,
      shuffleAnswer: question.shuffleAnswer ?? merged.shuffleAnswer,
      answerLayout: question.answerLayout ?? merged.answerLayout,
    };
  }

  return withDateQuestionDefaults(
    withShortAnswerDefaults(withChoiceQuestionDefaults(merged)),
  );
}

/** Date question defaults for older payloads (`MM/d/YYYY`, etc.). */
export function withDateQuestionDefaults(
  question: SurveyQuestion,
): SurveyQuestion {
  if (question.type !== "date") {
    return question;
  }

  const defaults = createQuestion("date", question.position);
  return {
    ...question,
    dateFormat: question.dateFormat ?? defaults.dateFormat,
    maxDateIsCurrentDay:
      question.maxDateIsCurrentDay ?? defaults.maxDateIsCurrentDay,
  };
}

/** Fills short-answer validation defaults for older payloads. */
export function withShortAnswerDefaults(
  question: SurveyQuestion,
): SurveyQuestion {
  if (question.type !== "short_answer") {
    return question;
  }

  const defaults = createQuestion("short_answer", question.position);
  return {
    ...question,
    placeholder: question.placeholder ?? defaults.placeholder,
    enabledAnswerValidation:
      question.enabledAnswerValidation ?? defaults.enabledAnswerValidation,
    answerFormat: question.answerFormat ?? defaults.answerFormat,
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
