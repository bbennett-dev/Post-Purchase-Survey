import { Text } from "@shopify/polaris";
import type {
  QuestionType,
  SurveyQuestion,
  ThankYouContent,
} from "../../../lib/survey/types";
import { EndingInspector } from "./Content/EndingInspector";
import { QuestionInspector } from "./Content/QuestionInspector";

export interface ContentInspectorProps {
  question: SurveyQuestion | null;
  ending: ThankYouContent | null;
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
  onTypeChange: (type: QuestionType) => void;
  onEndingChange: (patch: Partial<ThankYouContent>) => void;
  onDeleteQuestion: () => void;
}

/**
 * Content tab right panel: question inspector or thank-you ending inspector.
 */
export function ContentInspector({
  question,
  ending,
  onQuestionChange,
  onTypeChange,
  onEndingChange,
  onDeleteQuestion,
}: ContentInspectorProps) {
  if (ending) {
    return (
      <EndingInspector ending={ending} onEndingChange={onEndingChange} />
    );
  }

  if (!question) {
    return (
      <Text as="p" tone="subdued">
        Select a question or ending from the list.
      </Text>
    );
  }

  return (
    <QuestionInspector
      question={question}
      onQuestionChange={onQuestionChange}
      onTypeChange={onTypeChange}
      onDeleteQuestion={onDeleteQuestion}
    />
  );
}
