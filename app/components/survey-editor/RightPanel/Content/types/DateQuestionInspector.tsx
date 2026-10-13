import { BlockStack, Divider } from "@shopify/polaris";
import { QuestionImageBlock } from "../common/QuestionImageBlock";
import { QuestionSkippableCheckbox } from "../common/QuestionSkippableCheckbox";
import { resolveQuestionImage } from "../common/questionImageDefaults";
import { DateAnswerSection } from "../date/DateAnswerSection";
import type { QuestionTypeInspectorProps } from "./QuestionTypeInspectorProps";

/**
 * Date question — competitor layout: image → skip → Answer (format, min/max, current-day max).
 */
export function DateQuestionInspector({
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

      <Divider />

      <DateAnswerSection
        dateFormat={question.dateFormat}
        minDate={question.minDate}
        maxDate={question.maxDate}
        maxDateIsCurrentDay={question.maxDateIsCurrentDay === true}
        onChange={(patch) => onQuestionChange(patch)}
      />
    </BlockStack>
  );
}
