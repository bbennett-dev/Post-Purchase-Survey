import {
  BlockStack,
  Box,
  Checkbox,
  ChoiceList,
  Divider,
  InlineGrid,
  Text,
  TextField,
} from "@shopify/polaris";
import type {
  CustomAnswerShowWhen,
  SurveyAnswer,
  SurveyQuestion,
} from "../../../../lib/survey/types";

export interface CustomAnswerSectionProps {
  question: SurveyQuestion;
  answers: SurveyAnswer[];
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
}

const SHOW_WHEN_OPTIONS: { value: CustomAnswerShowWhen; label: string }[] = [
  { value: "always_show", label: "Always show" },
  {
    value: "when_customer_select_answers",
    label: "When customer select answer(s)",
  },
];

/**
 * “Other” answer block for single / multiple choice (toggle, visibility rules, copy).
 */
export function CustomAnswerSection({
  question,
  answers,
  onQuestionChange,
}: CustomAnswerSectionProps) {
  const enabled = question.enabledCustomAnswer === true;
  const showWhen: CustomAnswerShowWhen = question.showWhen ?? "always_show";
  const triggerIds = question.showCustomAnswerWhen ?? [];

  const toggleTriggerAnswer = (answerId: string, checked: boolean) => {
    const current = question.showCustomAnswerWhen ?? [];
    const next = checked
      ? current.includes(answerId)
        ? current
        : [...current, answerId]
      : current.filter((id) => id !== answerId);
    onQuestionChange({ showCustomAnswerWhen: next });
  };

  return (
    <Box borderWidth="025" borderColor="border" borderRadius="200" overflowX="hidden" overflowY="hidden">
      <Box padding="300">
        <InlineGrid columns="1fr auto" gap="200" alignItems="center">
          <Text as="p" fontWeight="semibold">
            Custom answer
          </Text>
          <Checkbox
            label="Enable custom answer"
            labelHidden
            checked={enabled}
            onChange={(checked) =>
              onQuestionChange({ enabledCustomAnswer: checked })
            }
          />
        </InlineGrid>
      </Box>

      {enabled ? (
        <>
          <Divider />
          <Box padding="300">
            <BlockStack gap="400">
              <ChoiceList
                title="When to show custom answer"
                titleHidden
                choices={SHOW_WHEN_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                selected={[showWhen]}
                onChange={(values) => {
                  const next = values[0];
                  if (
                    next === "always_show" ||
                    next === "when_customer_select_answers"
                  ) {
                    onQuestionChange({ showWhen: next });
                  }
                }}
              />

              {showWhen === "when_customer_select_answers" ? (
                <Box paddingInlineStart="400">
                  <BlockStack gap="200">
                    {answers.map((answer) => (
                      <Checkbox
                        key={answer.id}
                        label={answer.content || "Untitled answer"}
                        checked={triggerIds.includes(answer.id)}
                        onChange={(checked) =>
                          toggleTriggerAnswer(answer.id, checked)
                        }
                      />
                    ))}
                  </BlockStack>
                </Box>
              ) : null}

              <TextField
                label="Description"
                value={question.customAnswerPlaceholder ?? ""}
                onChange={(customAnswerPlaceholder) =>
                  onQuestionChange({ customAnswerPlaceholder })
                }
                autoComplete="off"
              />

              <Checkbox
                label="Make this required"
                checked={question.customAnswerRequired === true}
                onChange={(customAnswerRequired) =>
                  onQuestionChange({ customAnswerRequired })
                }
              />
            </BlockStack>
          </Box>
        </>
      ) : null}
    </Box>
  );
}
