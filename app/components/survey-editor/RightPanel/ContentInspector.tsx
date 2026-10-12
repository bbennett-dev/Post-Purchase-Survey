import {
  BlockStack,
  Button,
  Checkbox,
  InlineStack,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { DeleteIcon, MenuHorizontalIcon } from "@shopify/polaris-icons";
import { QUESTION_TYPES } from "../../../lib/survey/questions";
import type {
  QuestionType,
  SurveyQuestion,
  ThankYouContent,
} from "../../../lib/survey/types";
import { SingleChoiceQuestionFields } from "./Content/SingleChoiceQuestionFields";

export interface ContentInspectorProps {
  question: SurveyQuestion | null;
  ending: ThankYouContent | null;
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
  onTypeChange: (type: QuestionType) => void;
  onEndingChange: (patch: Partial<ThankYouContent>) => void;
  onDeleteQuestion: () => void;
}

/**
 * Content tab: edits the selected question or thank-you ending.
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
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Ending
        </Text>
        <TextField
          label="Heading"
          value={ending.heading}
          onChange={(heading) => onEndingChange({ heading })}
          autoComplete="off"
        />
        <TextField
          label="Description"
          value={ending.description}
          onChange={(description) => onEndingChange({ description })}
          multiline={3}
          autoComplete="off"
        />
        <TextField
          label="Button text"
          value={ending.buttonText}
          onChange={(buttonText) => onEndingChange({ buttonText })}
          autoComplete="off"
        />
      </BlockStack>
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
    <BlockStack gap="500">
      <InlineStack align="space-between" blockAlign="center">
        <Text as="h2" variant="headingMd">
          Question
        </Text>
        <Button
          icon={MenuHorizontalIcon}
          variant="tertiary"
          accessibilityLabel="Question actions"
          disabled
        />
      </InlineStack>

      <Select
        label="Question type"
        options={QUESTION_TYPES.map((item) => ({
          label: item.label,
          value: item.type,
        }))}
        value={question.type}
        onChange={(next) => {
          if (QUESTION_TYPES.some((item) => item.type === next)) {
            onTypeChange(next as QuestionType);
          }
        }}
      />

      <TextField
        label="Question title"
        value={question.heading}
        onChange={(heading) => onQuestionChange({ heading })}
        autoComplete="off"
      />

      <TextField
        label="Description"
        value={question.description ?? ""}
        onChange={(description) => onQuestionChange({ description })}
        multiline={3}
        autoComplete="off"
      />

      {question.type === "single" ? (
        <SingleChoiceQuestionFields
          question={question}
          onQuestionChange={onQuestionChange}
        />
      ) : (
        <LegacyQuestionFields
          question={question}
          onQuestionChange={onQuestionChange}
        />
      )}

      <Button
        icon={DeleteIcon}
        variant="plain"
        tone="critical"
        onClick={onDeleteQuestion}
      >
        Delete question
      </Button>
    </BlockStack>
  );
}

/** Non–single-choice types until each has its own inspector module. */
function LegacyQuestionFields({
  question,
  onQuestionChange,
}: {
  question: SurveyQuestion;
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
}) {
  return (
    <BlockStack gap="400">
      <Checkbox
        label="Allow customers to skip this question"
        checked={question.skippable}
        onChange={(skippable) => onQuestionChange({ skippable })}
      />
      {question.answers ? (
        <BlockStack gap="200">
          <Text as="p" fontWeight="semibold">
            Answers
          </Text>
          {question.answers.map((answer) => (
            <TextField
              key={answer.id}
              label="Answer"
              labelHidden
              value={answer.content}
              onChange={(content) => {
                onQuestionChange({
                  answers: question.answers?.map((item) =>
                    item.id === answer.id ? { ...item, content } : item,
                  ),
                });
              }}
              autoComplete="off"
            />
          ))}
        </BlockStack>
      ) : null}
      {question.leftLabel !== undefined ? (
        <TextField
          label="Left label"
          value={question.leftLabel}
          onChange={(leftLabel) => onQuestionChange({ leftLabel })}
          autoComplete="off"
        />
      ) : null}
      {question.rightLabel !== undefined ? (
        <TextField
          label="Right label"
          value={question.rightLabel}
          onChange={(rightLabel) => onQuestionChange({ rightLabel })}
          autoComplete="off"
        />
      ) : null}
      {question.placeholder !== undefined ? (
        <TextField
          label="Placeholder"
          value={question.placeholder}
          onChange={(placeholder) => onQuestionChange({ placeholder })}
          autoComplete="off"
        />
      ) : null}
      {question.agreeDescriptionEmail !== undefined ? (
        <TextField
          label="Agreement label"
          value={question.agreeDescriptionEmail}
          onChange={(agreeDescriptionEmail) =>
            onQuestionChange({ agreeDescriptionEmail })
          }
          autoComplete="off"
        />
      ) : null}
    </BlockStack>
  );
}
