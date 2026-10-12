import { useState } from "react";
import type { SurveyAnswer } from "../../../../lib/survey/types";
import { fieldValue } from "../../field-value";
import { AddListRow } from "../../LeftPanel/AddListRow";
import styles from "./choice-answer-list.module.css";

export interface ChoiceAnswerListEditorProps {
  answers: SurveyAnswer[];
  onChange: (answers: SurveyAnswer[]) => void;
}

function nextAnswerId(): string {
  return `answer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function reorderAnswers(
  answers: SurveyAnswer[],
  fromId: string,
  toId: string,
): SurveyAnswer[] {
  if (fromId === toId) {
    return answers;
  }
  const fromIndex = answers.findIndex((item) => item.id === fromId);
  const toIndex = answers.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0) {
    return answers;
  }
  const next = [...answers];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Draggable choice answer rows for the content inspector (single / multiple choice).
 */
export function ChoiceAnswerListEditor({
  answers,
  onChange,
}: ChoiceAnswerListEditorProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const patchAnswer = (id: string, content: string) => {
    onChange(
      answers.map((item) => (item.id === id ? { ...item, content } : item)),
    );
  };

  const deleteAnswer = (id: string) => {
    if (answers.length <= 1) {
      return;
    }
    onChange(answers.filter((item) => item.id !== id));
  };

  const addAnswer = () => {
    const index = answers.length + 1;
    onChange([
      ...answers,
      { id: nextAnswerId(), content: `ans ${index}` },
    ]);
  };

  return (
    <s-stack gap="small-200">
      <s-text type="strong">Answer(s)</s-text>

      {answers.map((answer) => (
        <div
          key={answer.id}
          className={`${styles.row} ${draggingId === answer.id ? styles.rowDragging : ""}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const fromId = event.dataTransfer.getData("text/answer-id");
            if (fromId) {
              onChange(reorderAnswers(answers, fromId, answer.id));
            }
            setDraggingId(null);
          }}
        >
          <s-grid
            gridTemplateColumns="auto minmax(0, 1fr) auto"
            gap="small-200"
            alignItems="center"
          >
            <s-box padding="small-200">
              <div
                className={styles.dragHandle}
                draggable
                role="button"
                tabIndex={0}
                aria-label={`Reorder ${answer.content || "answer"}`}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/answer-id", answer.id);
                  event.dataTransfer.effectAllowed = "move";
                  setDraggingId(answer.id);
                }}
                onDragEnd={() => setDraggingId(null)}
              >
                <s-icon type="drag-handle" color="subdued" />
              </div>
            </s-box>
            <s-text-field
              label="Answer"
              labelAccessibilityVisibility="exclusive"
              value={answer.content}
              onInput={(event) => patchAnswer(answer.id, fieldValue(event))}
            />
            <s-button
              variant="secondary"
              icon="delete"
              tone="critical"
              accessibilityLabel={`Delete ${answer.content || "answer"}`}
              disabled={answers.length <= 1}
              onClick={() => deleteAnswer(answer.id)}
            />
          </s-grid>
        </div>
      ))}

      <AddListRow label="Add answer" onClick={addAnswer} />
    </s-stack>
  );
}
