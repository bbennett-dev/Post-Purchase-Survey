import { BlockStack, Divider, TextField } from "@shopify/polaris";
import { QuestionImageBlock } from "../common/QuestionImageBlock";
import { QuestionSkippableCheckbox } from "../common/QuestionSkippableCheckbox";
import { resolveQuestionImage } from "../common/questionImageDefaults";
import type { QuestionTypeInspectorProps } from "./QuestionTypeInspectorProps";

/**
 * Email — competitor layout: image → skip → Answer (placeholder).
 */
export function EmailQuestionInspector({
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
        checked={question.skippable}
        onChange={(skippable) => onQuestionChange({ skippable })}
      />

      {/* <Divider /> */}

      <TextField
        label="Placeholder"
        value={question.placeholder ?? ""}
        onChange={(value) => onQuestionChange({ placeholder: value })}
        autoComplete="off"
      />
    </BlockStack>
  );
}
