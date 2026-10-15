import { BlockStack, Divider } from "@shopify/polaris";
import type { ChoiceAnswerLayout } from "../../../../../lib/survey/types";
import { QuestionImageBlock } from "../common/QuestionImageBlock";
import { QuestionRequiredCheckbox } from "../common/QuestionRequiredCheckbox";
import { resolveQuestionImage } from "../common/questionImageDefaults";
import type { QuestionTypeInspectorProps } from "../types/QuestionTypeInspectorProps";
import { ChoiceAnswerLayoutSelect } from "./ChoiceAnswerLayoutSelect";
import { ChoiceAnswerListEditor } from "./ChoiceAnswerListEditor";
import { CustomAnswerSection } from "./CustomAnswerSection";
import { ShuffleAnswersField } from "./ShuffleAnswersField";

/**
 * Right-panel body for single and multiple choice — identical fields and layout.
 */
export function ChoiceQuestionInspector({
  question,
  onQuestionChange,
}: QuestionTypeInspectorProps) {
  const answers = question.answers ?? [];
  const answerLayout: ChoiceAnswerLayout = question.answerLayout ?? "text_only";

  return (
    <BlockStack gap="500">
      <QuestionImageBlock
        image={resolveQuestionImage(question)}
        onChange={(image) => onQuestionChange({ image })}
        showSize
      />

      <QuestionRequiredCheckbox
        required={!question.skippable}
        onChange={(required) => onQuestionChange({ skippable: !required })}
      />

      {/* <ChoiceAnswerLayoutSelect
        value={answerLayout}
        onChange={(layout) => onQuestionChange({ answerLayout: layout })}
      /> */}

      <Divider />

      <ChoiceAnswerListEditor
        answers={answers}
        onChange={(next) => onQuestionChange({ answers: next })}
      />

      <ShuffleAnswersField
        checked={question.shuffleAnswer === true}
        onChange={(shuffleAnswer) => onQuestionChange({ shuffleAnswer })}
      />

      <Divider />

      <CustomAnswerSection
        question={question}
        answers={answers}
        onQuestionChange={onQuestionChange}
      />
    </BlockStack>
  );
}
