import type { QuestionTypeInspectorProps } from "./QuestionTypeInspectorProps";
import { ScaleQuestionFields } from "./ScaleQuestionFields";

/** Satisfaction — same fields/order as number scale and star rating. */
export function SatisfactionInspector(props: QuestionTypeInspectorProps) {
  return <ScaleQuestionFields {...props} />;
}
