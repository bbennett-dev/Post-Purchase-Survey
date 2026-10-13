import { BlockStack } from "@shopify/polaris";
import type { QuestionType, SurveyQuestion } from "../../../../lib/survey/types";
import { DeleteQuestionButton } from "./common/DeleteQuestionButton";
import { QuestionDescriptionField } from "./common/QuestionDescriptionField";
import { QuestionHeadingField } from "./common/QuestionHeadingField";
import { QuestionTypeSelect } from "./common/QuestionTypeSelect";
import { QuestionTypeInspector } from "./questionInspectorRegistry";

export interface QuestionInspectorProps {
  question: SurveyQuestion;
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
  onTypeChange: (type: QuestionType) => void;
  onDeleteQuestion: () => void;
}

/**
 * Right-panel question editor: shared fields + type-specific modules from the registry.
 */
export function QuestionInspector({
  question,
  onQuestionChange,
  onTypeChange,
  onDeleteQuestion,
}: QuestionInspectorProps) {
  return (
    <BlockStack gap="500">
      <QuestionTypeSelect
        value={question.type}
        onChange={onTypeChange}
      />

      <QuestionHeadingField
        value={question.heading}
        onChange={(heading) => onQuestionChange({ heading })}
      />

      <QuestionDescriptionField
        value={question.description ?? ""}
        onChange={(description) => onQuestionChange({ description })}
      />

      <QuestionTypeInspector
        question={question}
        onQuestionChange={onQuestionChange}
      />

      <DeleteQuestionButton onClick={onDeleteQuestion} />
    </BlockStack>
  );
}
