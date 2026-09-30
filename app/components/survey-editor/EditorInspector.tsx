import { QUESTION_TYPES } from "../../lib/survey/questions";
import type { QuestionType, SurveyQuestion, ThankYouContent } from "../../lib/survey/types";
import { fieldValue } from "./field-value";

interface EditorInspectorProps {
  question: SurveyQuestion | null;
  ending: ThankYouContent | null;
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
  onTypeChange: (type: QuestionType) => void;
  onEndingChange: (patch: Partial<ThankYouContent>) => void;
  onDeleteQuestion: () => void;
}

/**
 * Right editor column. Edits the selected question or ending.
 */
export function EditorInspector({
  question,
  ending,
  onQuestionChange,
  onTypeChange,
  onEndingChange,
  onDeleteQuestion,
}: EditorInspectorProps) {
  if (ending) {
    return (
      <s-box
        padding="base"
        background="base"
        border="base"
        borderRadius="base"
        overflow="hidden"
        minBlockSize="720px"
      >
        <s-stack gap="base">
          <s-heading>Ending</s-heading>
          <s-text-field
            label="Heading"
            value={ending.heading}
            onInput={(event) => onEndingChange({ heading: fieldValue(event) })}
          />
          <s-text-area
            label="Description"
            value={ending.description}
            onInput={(event) =>
              onEndingChange({ description: fieldValue(event) })
            }
          />
          <s-text-field
            label="Button text"
            value={ending.buttonText}
            onInput={(event) =>
              onEndingChange({ buttonText: fieldValue(event) })
            }
          />
        </s-stack>
      </s-box>
    );
  }

  if (!question) {
    return (
      <s-box
        padding="base"
        background="base"
        border="base"
        borderRadius="base"
        minBlockSize="720px"
      >
        <s-paragraph color="subdued">
          Select a question or an ending.
        </s-paragraph>
      </s-box>
    );
  }

  return (
    <s-box
      padding="base"
      background="base"
      border="base"
      borderRadius="base"
      overflow="hidden"
      minBlockSize="720px"
    >
      <s-stack gap="base">
        <s-heading>Question</s-heading>
        <s-select
          label="Question type"
          value={question.type}
          onChange={(event) => {
            const next = fieldValue(event);
            if (QUESTION_TYPES.some((item) => item.type === next)) {
              onTypeChange(next as QuestionType);
            }
          }}
        >
          {QUESTION_TYPES.map((item) => (
            <s-option key={item.type} value={item.type}>
              {item.label}
            </s-option>
          ))}
        </s-select>
        <s-text-field
          label="Heading"
          value={question.heading}
          onInput={(event) => onQuestionChange({ heading: fieldValue(event) })}
        />
        <s-text-area
          label="Description"
          value={question.description ?? ""}
          onInput={(event) =>
            onQuestionChange({ description: fieldValue(event) })
          }
        />
        <s-text-field
          label="Image URL"
          value={question.image?.url ?? ""}
          onInput={(event) =>
            onQuestionChange({
              image: {
                url: fieldValue(event),
                alignment: question.image?.alignment ?? "center",
                sizePercentage: question.image?.sizePercentage ?? 100,
              },
            })
          }
        />
        <s-select
          label="Image alignment"
          value={question.image?.alignment ?? "center"}
          onChange={(event) => {
            const alignment = fieldValue(event);
            if (
              alignment === "left" ||
              alignment === "center" ||
              alignment === "right"
            ) {
              onQuestionChange({
                image: {
                  url: question.image?.url ?? "",
                  alignment,
                  sizePercentage: question.image?.sizePercentage ?? 100,
                },
              });
            }
          }}
        >
          <s-option value="left">Left</s-option>
          <s-option value="center">Center</s-option>
          <s-option value="right">Right</s-option>
        </s-select>
        <s-checkbox
          label="Allow customers to skip this question"
          checked={question.skippable}
          onChange={(event) =>
            onQuestionChange({
              skippable: Boolean(
                (event.currentTarget as HTMLElement & { checked?: boolean })
                  .checked,
              ),
            })
          }
        />
        {question.answers ? (
          <s-stack gap="small-200">
            <s-text type="strong">Answers</s-text>
            {question.answers.map((answer) => (
              <s-text-field
                key={answer.id}
                label="Answer"
                labelAccessibilityVisibility="exclusive"
                value={answer.content}
                onInput={(event) => {
                  const content = fieldValue(event);
                  onQuestionChange({
                    answers: question.answers?.map((item) =>
                      item.id === answer.id ? { ...item, content } : item,
                    ),
                  });
                }}
              />
            ))}
          </s-stack>
        ) : null}
        {question.leftLabel !== undefined ? (
          <s-text-field
            label="Left label"
            value={question.leftLabel}
            onInput={(event) =>
              onQuestionChange({ leftLabel: fieldValue(event) })
            }
          />
        ) : null}
        {question.rightLabel !== undefined ? (
          <s-text-field
            label="Right label"
            value={question.rightLabel}
            onInput={(event) =>
              onQuestionChange({ rightLabel: fieldValue(event) })
            }
          />
        ) : null}
        {question.placeholder !== undefined ? (
          <s-text-field
            label="Placeholder"
            value={question.placeholder}
            onInput={(event) =>
              onQuestionChange({ placeholder: fieldValue(event) })
            }
          />
        ) : null}
        {question.agreeDescriptionEmail !== undefined ? (
          <s-text-field
            label="Agreement label"
            value={question.agreeDescriptionEmail}
            onInput={(event) =>
              onQuestionChange({
                agreeDescriptionEmail: fieldValue(event),
              })
            }
          />
        ) : null}
        <s-button icon="delete" tone="critical" onClick={onDeleteQuestion}>
          Delete question
        </s-button>
      </s-stack>
    </s-box>
  );
}
