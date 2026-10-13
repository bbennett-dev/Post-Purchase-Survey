import { BlockStack } from "@shopify/polaris";
import { QuestionImageBlock } from "../common/QuestionImageBlock";
import { QuestionSkippableCheckbox } from "../common/QuestionSkippableCheckbox";
import { ScaleLabelsFields } from "../common/ScaleLabelsFields";
import { resolveQuestionImage } from "../common/questionImageDefaults";
import type { QuestionTypeInspectorProps } from "./QuestionTypeInspectorProps";

/**
 * Shared scale-style body: image → left/right labels → allow skip
 * (number scale, star rating, satisfaction).
 */
export function ScaleQuestionFields({
  question,
  onQuestionChange,
}: QuestionTypeInspectorProps) {
  return (
    <BlockStack gap="500">
      <QuestionImageBlock
        image={resolveQuestionImage(question)}
        onChange={(image) => onQuestionChange({ image })}
        showSize
      />

      <ScaleLabelsFields
        leftLabel={question.leftLabel ?? ""}
        rightLabel={question.rightLabel ?? ""}
        onChange={(patch) => onQuestionChange(patch)}
      />

      <QuestionSkippableCheckbox
        checked={question.skippable}
        onChange={(skippable) => onQuestionChange({ skippable })}
      />
    </BlockStack>
  );
}
