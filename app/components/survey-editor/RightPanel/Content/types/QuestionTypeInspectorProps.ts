import type { SurveyQuestion } from "../../../../../lib/survey/types";

/** Props for per–question-type right-panel bodies (below shared heading fields). */
export interface QuestionTypeInspectorProps {
  question: SurveyQuestion;
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
}
