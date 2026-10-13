import type { QuestionTypeInspectorProps } from "./QuestionTypeInspectorProps";
import { ScaleQuestionFields } from "./ScaleQuestionFields";

/** Number scale — shared scale body (image → labels → skip). */
export function NumberScaleInspector(props: QuestionTypeInspectorProps) {
  return <ScaleQuestionFields {...props} />;
}
