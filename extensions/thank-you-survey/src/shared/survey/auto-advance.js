import { CHOICE_TYPES, SCALE_TYPES } from "./constants.js";
import { choiceAnswersForQuestion, isOtherAnswer } from "./question-answers.js";
import { validateQuestionStep } from "./validate.js";

/**
 * Competitor-style flow: picking a definitive answer advances without tapping Next.
 * Multiple choice stays manual; free-text and required "Other" text wait for Next.
 */
export function shouldAutoAdvanceAfterAnswer(question, draft) {
  if (!question) {
    return false;
  }
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
      !draft.customText?.trim()
    ) {
      return false;
    }
    return validateQuestionStep(question, draft);
  }
  if (question.type === "consent_email") {
    return draft.answerIds.includes("consent");
  }
  if (CHOICE_TYPES.has(question.type)) {
    return false;
  }
  return false;
}

export function canAutoAdvanceStep(question, draft) {
  if (!shouldAutoAdvanceAfterAnswer(question, draft)) {
    return false;
  }
  return validateQuestionStep(question, draft);
}
