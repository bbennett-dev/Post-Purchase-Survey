import type { SurveyAnswer, SurveyQuestion } from "./types";

const CHOICE_TYPES = new Set<SurveyQuestion["type"]>(["single", "multiple"]);
const SCALE_TYPES = new Set<SurveyQuestion["type"]>([
  "number_scale",
  "star_rating",
  "satisfaction",
]);

export interface SurveyAnswerDraft {
  answerIds: string[];
  customText: string;
}

export function emptySurveyAnswerDraft(): SurveyAnswerDraft {
  return { answerIds: [], customText: "" };
}

export function sortedSurveyQuestions(
  questions: SurveyQuestion[],
): SurveyQuestion[] {
  return [...questions].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function isOtherAnswer(answer: SurveyAnswer | undefined): boolean {
  return answer?.content?.toLowerCase() === "other";
}

/** Mirrors checkout extension scale synthesis (`shared.jsx`). */
export function choiceAnswersForQuestion(
  question: SurveyQuestion,
): SurveyAnswer[] {
  if (question.answers?.length) {
    return question.answers;
  }
  if (!SCALE_TYPES.has(question.type)) {
    return [];
  }
  if (question.type === "number_scale") {
    return Array.from({ length: 10 }, (_, index) => {
      const value = index + 1;
      return {
        id: `${question.id}_scale_${value}`,
        content: String(value),
      };
    });
  }
  if (question.type === "star_rating" || question.type === "satisfaction") {
    return Array.from({ length: 5 }, (_, index) => {
      const value = index + 1;
      return {
        id: `${question.id}_scale_${value}`,
        content: String(value),
      };
    });
  }
  return [];
}

export function validateQuestionStep(
  question: SurveyQuestion,
  draft: SurveyAnswerDraft,
): boolean {
  if (question.skippable) {
    return true;
  }
  if (CHOICE_TYPES.has(question.type) || SCALE_TYPES.has(question.type)) {
    if (draft.answerIds.length === 0) {
      return false;
    }
    if (question.type === "single") {
      const selected = choiceAnswersForQuestion(question).find(
        (answer) => answer.id === draft.answerIds[0],
      );
      if (
        isOtherAnswer(selected) &&
        question.enabledCustomAnswer !== false &&
        question.customAnswerRequired === true &&
        !draft.customText.trim()
      ) {
        return false;
      }
    }
    return true;
  }
  if (question.type === "consent_email") {
    return draft.answerIds.includes("consent");
  }
  if (question.type === "text_image") {
    return Boolean(question.image?.url);
  }
  return draft.answerIds.length > 0 || Boolean(draft.customText.trim());
}

/**
 * Advance on answer selection (competitor checkout flow). Multiple choice and
 * free-text steps still use Next; required "Other" waits for the text field.
 */
export function shouldAutoAdvanceAfterAnswer(
  question: SurveyQuestion,
  draft: SurveyAnswerDraft,
): boolean {
  if (question.type === "multiple") {
    return false;
  }
  if (SCALE_TYPES.has(question.type)) {
    return draft.answerIds.length > 0;
  }
  if (question.type === "single") {
    if (draft.answerIds.length === 0) {
      return false;
    }
    const selected = choiceAnswersForQuestion(question).find(
      (answer) => answer.id === draft.answerIds[0],
    );
    if (
      isOtherAnswer(selected) &&
      question.enabledCustomAnswer !== false &&
      question.customAnswerRequired === true &&
      !draft.customText.trim()
    ) {
      return false;
    }
    return validateQuestionStep(question, draft);
  }
  if (question.type === "consent_email") {
    return draft.answerIds.includes("consent");
  }
  return false;
}

export function canAutoAdvanceStep(
  question: SurveyQuestion,
  draft: SurveyAnswerDraft,
): boolean {
  if (!shouldAutoAdvanceAfterAnswer(question, draft)) {
    return false;
  }
  return validateQuestionStep(question, draft);
}
