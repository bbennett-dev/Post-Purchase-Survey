import { BlockStack } from "@shopify/polaris";
import { QuestionImageBlock } from "../common/QuestionImageBlock";
import { QuestionSkippableCheckbox } from "../common/QuestionSkippableCheckbox";
import { resolveQuestionImage } from "../common/questionImageDefaults";
import type { QuestionTypeInspectorProps } from "./QuestionTypeInspectorProps";

/**
 * Text & image — competitor layout: hero image only; skip is always on and locked.
 */
export function TextImageInspector({
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

      <QuestionSkippableCheckbox
        checked
        disabled
        onChange={() => onQuestionChange({ skippable: true })}
      />
    </BlockStack>
  );
}
