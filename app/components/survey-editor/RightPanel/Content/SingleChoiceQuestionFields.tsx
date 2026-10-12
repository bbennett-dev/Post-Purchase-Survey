import {
  BlockStack,
  Box,
  Checkbox,
  Divider,
  InlineGrid,
  Select,
  Text,
} from "@shopify/polaris";
import type {
  ChoiceAnswerLayout,
  SurveyQuestion,
} from "../../../../lib/survey/types";
import { QuestionImageSection } from "../../shared/QuestionImageSection";
import { ChoiceAnswerListEditor } from "./ChoiceAnswerListEditor";
import { CustomAnswerSection } from "./CustomAnswerSection";

export interface SingleChoiceQuestionFieldsProps {
  question: SurveyQuestion;
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
}

const defaultImage = (question: SurveyQuestion) =>
  question.image ?? {
    url: "",
    alignment: "center" as const,
    sizePercentage: 100,
  };

const ANSWER_LAYOUT_OPTIONS: { label: string; value: ChoiceAnswerLayout }[] = [
  { value: "text_only", label: "Text only" },
  { value: "text_with_image", label: "Text with image" },
];

/**
 * Right-panel fields specific to single-choice questions.
 */
export function SingleChoiceQuestionFields({
  question,
  onQuestionChange,
}: SingleChoiceQuestionFieldsProps) {
  const answers = question.answers ?? [];
  const answerLayout = question.answerLayout ?? "text_only";

  return (
    <BlockStack gap="500">
      <QuestionImageSection
        image={defaultImage(question)}
        onChange={(image) => onQuestionChange({ image })}
        showSize
      />

      <Checkbox
        label="Allow customers to skip this question"
        checked={question.skippable}
        onChange={(skippable) => onQuestionChange({ skippable })}
      />

      <InlineGrid columns="1fr minmax(140px, 11.75rem)" gap="200" alignItems="end">
        <Text as="span">Answer layout</Text>
        <Box minWidth="0">
          <Select
            label="Answer layout"
            labelHidden
            options={ANSWER_LAYOUT_OPTIONS}
            value={answerLayout}
            onChange={(next) => {
              if (next === "text_only" || next === "text_with_image") {
                onQuestionChange({ answerLayout: next });
              }
            }}
          />
        </Box>
      </InlineGrid>

      <Divider />

      <ChoiceAnswerListEditor
        answers={answers}
        onChange={(next) => onQuestionChange({ answers: next })}
      />

      <Checkbox
        label="Shuffle answers"
        checked={question.shuffleAnswer === true}
        onChange={(shuffleAnswer) => onQuestionChange({ shuffleAnswer })}
      />
      <Text as="p" tone="subdued">
        Randomize answer order for each user
      </Text>

      <Divider />

      <CustomAnswerSection
        question={question}
        answers={answers}
        onQuestionChange={onQuestionChange}
      />
    </BlockStack>
  );
}
