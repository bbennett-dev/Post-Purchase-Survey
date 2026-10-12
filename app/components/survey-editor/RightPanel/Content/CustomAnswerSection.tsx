import type {
  CustomAnswerShowWhen,
  SurveyAnswer,
  SurveyQuestion,
} from "../../../../lib/survey/types";
import { fieldValue } from "../../field-value";

export interface CustomAnswerSectionProps {
  question: SurveyQuestion;
  answers: SurveyAnswer[];
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
}

const SHOW_WHEN_OPTIONS: {
  value: CustomAnswerShowWhen;
  label: string;
}[] = [
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
  const showWhen: CustomAnswerShowWhen =
    question.showWhen ?? "always_show";
  const triggerIds = question.showCustomAnswerWhen ?? [];
  const listName = `custom-answer-show-${question.id}`;

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
    <s-box border="base" borderRadius="base" overflow="hidden">
      <s-box padding="small">
        <s-grid
          gridTemplateColumns="minmax(0, 1fr) auto"
          gap="small-200"
          alignItems="center"
        >
          <s-text type="strong">Custom answer</s-text>
          <s-switch
            label="Enable custom answer"
            labelAccessibilityVisibility="exclusive"
            checked={enabled}
            onChange={(event) =>
              onQuestionChange({
                enabledCustomAnswer: Boolean(
                  (event.currentTarget as HTMLElement & { checked?: boolean })
                    .checked,
                ),
              })
            }
          />
        </s-grid>
      </s-box>

      {enabled ? (
        <>
          <s-divider direction="inline" color="base" />
          <s-box padding="small">
            <s-stack gap="base">
              <s-choice-list
                label="When to show custom answer"
                labelAccessibilityVisibility="exclusive"
                name={listName}
                values={[showWhen]}
                onChange={(event) => {
                  const next = (
                    event.currentTarget as HTMLElement & {
                      values?: string[];
                    }
                  ).values?.[0];
                  if (
                    next === "always_show" ||
                    next === "when_customer_select_answers"
                  ) {
                    onQuestionChange({ showWhen: next });
                  }
                }}
              >
                {SHOW_WHEN_OPTIONS.map((option) => (
                  <s-choice key={option.value} value={option.value}>
                    {option.label}
                  </s-choice>
                ))}
              </s-choice-list>

              {showWhen === "when_customer_select_answers" ? (
                <s-box paddingInlineStart="large-100">
                  <s-stack gap="small-200">
                    {answers.map((answer) => (
                      <s-checkbox
                        key={answer.id}
                        label={answer.content || "Untitled answer"}
                        checked={triggerIds.includes(answer.id)}
                        onChange={(event) =>
                          toggleTriggerAnswer(
                            answer.id,
                            Boolean(
                              (
                                event.currentTarget as HTMLElement & {
                                  checked?: boolean;
                                }
                              ).checked,
                            ),
                          )
                        }
                      />
                    ))}
                  </s-stack>
                </s-box>
              ) : null}

              <s-text-field
                label="Description"
                value={question.customAnswerPlaceholder ?? ""}
                onInput={(event) =>
                  onQuestionChange({
                    customAnswerPlaceholder: fieldValue(event),
                  })
                }
              />

              <s-checkbox
                label="Make this required"
                checked={question.customAnswerRequired === true}
                onChange={(event) =>
                  onQuestionChange({
                    customAnswerRequired: Boolean(
                      (
                        event.currentTarget as HTMLElement & {
                          checked?: boolean;
                        }
                      ).checked,
                    ),
                  })
                }
              />
            </s-stack>
          </s-box>
        </>
      ) : null}
    </s-box>
  );
}
