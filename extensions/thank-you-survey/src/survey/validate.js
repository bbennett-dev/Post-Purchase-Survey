import { CHOICE_TYPES, SCALE_TYPES } from "./constants.js";
import { choiceAnswersForQuestion, isOtherAnswer } from "./question-answers.js";

/** Mirrors `validateQuestionStep` in `app/lib/survey/preview-survey-flow.ts`. */
export function validateQuestionStep(question, draft) {
  if (!question) {
    return false;
  }
  if (question.skippable) {
    return true;
  }
  if (CHOICE_TYPES.has(question.type) || SCALE_TYPES.has(question.type)) {
    if (draft.answerIds.length === 0) {
      return false;
    }
    if (question.type === "single") {
      const selected = choiceAnswersForQuestion(question).find(
        (a) => a.id === draft.answerIds[0],
      );
      if (
        isOtherAnswer(selected) &&
        question.enabledCustomAnswer !== false &&
        question.customAnswerRequired === true &&
        !draft.customText?.trim()
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
  return draft.answerIds.length > 0 || Boolean(draft.customText?.trim());
}
