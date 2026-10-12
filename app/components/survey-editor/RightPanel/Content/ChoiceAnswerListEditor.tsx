import { useState, type DragEvent } from "react";
import {
  BlockStack,
  Box,
  Button,
  Icon,
  InlineGrid,
  Text,
  TextField,
  UnstyledButton,
} from "@shopify/polaris";
import { DeleteIcon, DragHandleIcon } from "@shopify/polaris-icons";
import type { SurveyAnswer } from "../../../../lib/survey/types";
import { AddListRow } from "../../LeftPanel/AddListRow";

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
    <BlockStack gap="200">
      <Text as="p" fontWeight="semibold">
        Answer(s)
      </Text>

      {answers.map((answer) => (
        <div
          key={answer.id}
          onDragOver={(event: DragEvent) => event.preventDefault()}
          onDrop={(event: DragEvent) => {
            event.preventDefault();
            const fromId = event.dataTransfer.getData("text/answer-id");
            if (fromId) {
              onChange(reorderAnswers(answers, fromId, answer.id));
            }
            setDraggingId(null);
          }}
        >
          <Box
            padding="100"
            background="bg-surface-secondary"
            borderRadius="200"
            opacity={draggingId === answer.id ? "0.45" : undefined}
          >
          <InlineGrid columns="auto minmax(0, 1fr) auto" gap="200" alignItems="center">
            <Box padding="200">
              <UnstyledButton
                accessibilityLabel={`Reorder ${answer.content || "answer"}`}
              >
                <div
                  draggable
                  role="button"
                  tabIndex={0}
                  onDragStart={(event: DragEvent) => {
                    event.dataTransfer.setData("text/answer-id", answer.id);
                    event.dataTransfer.effectAllowed = "move";
                    setDraggingId(answer.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                >
                  <Icon source={DragHandleIcon} tone="subdued" />
                </div>
              </UnstyledButton>
            </Box>
            <TextField
              label="Answer"
              labelHidden
              value={answer.content}
              onChange={(content) => patchAnswer(answer.id, content)}
              autoComplete="off"
            />
            <Button
              icon={DeleteIcon}
              tone="critical"
              accessibilityLabel={`Delete ${answer.content || "answer"}`}
              disabled={answers.length <= 1}
              onClick={() => deleteAnswer(answer.id)}
            />
          </InlineGrid>
          </Box>
        </div>
      ))}

      <AddListRow label="Add answer" onClick={addAnswer} />
    </BlockStack>
  );
}
