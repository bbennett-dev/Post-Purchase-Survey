import { SCALE_TYPES } from "./constants.js";

export function isOtherAnswer(answer) {
  return answer?.content?.toLowerCase() === "other";
}

/** Mirrors `app/lib/survey/preview-survey-flow.ts` — synthesize scale options when absent. */
export function choiceAnswersForQuestion(question) {
  if (question.answers?.length) {
    return question.answers;
  }
  if (!question?.id || !SCALE_TYPES.has(question.type)) {
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
