import type { SurveyImage, SurveyQuestion } from "../../../../../lib/survey/types";

/** Document-safe image object for inspector controls. */
export function resolveQuestionImage(question: SurveyQuestion): SurveyImage {
  return (
    question.image ?? {
      url: "",
      alignment: "center",
      sizePercentage: 100,
    }
  );
}
