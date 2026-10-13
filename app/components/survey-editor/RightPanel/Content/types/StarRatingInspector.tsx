import type { QuestionTypeInspectorProps } from "./QuestionTypeInspectorProps";
import { ScaleQuestionFields } from "./ScaleQuestionFields";

/** Star rating — same fields/order as number scale (competitor reference). */
export function StarRatingInspector(props: QuestionTypeInspectorProps) {
  return <ScaleQuestionFields {...props} />;
}
