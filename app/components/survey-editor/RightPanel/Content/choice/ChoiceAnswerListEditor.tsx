import { useCallback, useEffect, useRef, useState } from "react";
import { BlockStack, Text } from "@shopify/polaris";
import type { SurveyAnswer } from "../../../../../lib/survey/types";
import {
  DRAG_THRESHOLD,
  insertAtFromPoint,
  orderWithInsert,
  type DragSession,
} from "../../../LeftPanel/Content/questionDrag";
import { QuestionDropLine } from "../../../QuestionDropLine";
import { useQuestionDragCursor } from "../../../useEditorViewport";
import { AddListRow } from "../../../LeftPanel/AddListRow";
import { AnswerChoiceRow } from "./AnswerChoiceRow";
import { AnswerDragPreview } from "./AnswerDragPreview";

export interface ChoiceAnswerListEditorProps {
  answers: SurveyAnswer[];
  onChange: (answers: SurveyAnswer[]) => void;
}

function nextAnswerId(): string {
  return `answer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function answerOrder(answers: SurveyAnswer[]): string[] {
  return answers.map((answer) => answer.id);
}

function reorderByIds(answers: SurveyAnswer[], order: string[]): SurveyAnswer[] {
  const byId = new Map(answers.map((answer) => [answer.id, answer]));
  return order.flatMap((id) => {
    const answer = byId.get(id);
    return answer ? [answer] : [];
  });
}

/** Draggable choice answer rows (pointer + ghost preview, same pattern as question list). */
export function ChoiceAnswerListEditor({
  answers,
  onChange,
}: ChoiceAnswerListEditorProps) {
  const [pending, setPending] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [drag, setDrag] = useState<DragSession | null>(null);
  const rows = useRef(new Map<string, HTMLElement>());
  const dragRef = useRef<DragSession | null>(null);
  const pendingRef = useRef(pending);
  const answersRef = useRef(answers);
  const onChangeRef = useRef(onChange);
  const sessionActive = pending !== null || drag !== null;
  useQuestionDragCursor(sessionActive);

  pendingRef.current = pending;
  dragRef.current = drag;
  answersRef.current = answers;
  onChangeRef.current = onChange;

  const registerRow = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      rows.current.set(id, element);
      return;
    }
    rows.current.delete(id);
  }, []);

  useEffect(() => {
    if (!sessionActive) {
      return;
    }

    const startOrMove = (event: PointerEvent) => {
      const activePending = pendingRef.current;
      const activeDrag = dragRef.current;

      if (activePending && !activeDrag) {
        const distance = Math.hypot(
          event.clientX - activePending.x,
          event.clientY - activePending.y,
        );
        if (distance < DRAG_THRESHOLD) {
          return;
        }

        const original = answerOrder(answersRef.current);
        const next: DragSession = {
          id: activePending.id,
          x: event.clientX,
          y: event.clientY,
          insertAt: insertAtFromPoint(
            original,
            activePending.id,
            event.clientY,
            rows.current,
            original.indexOf(activePending.id),
          ),
        };
        dragRef.current = next;
        setPending(null);
        setDrag(next);
        return;
      }

      if (!activeDrag) {
        return;
      }

      const original = answerOrder(answersRef.current);
      const next: DragSession = {
        ...activeDrag,
        x: event.clientX,
        y: event.clientY,
        insertAt: insertAtFromPoint(
          original,
          activeDrag.id,
          event.clientY,
          rows.current,
          activeDrag.insertAt,
        ),
      };
      dragRef.current = next;
      setDrag(next);
    };

    const finish = () => {
      const activeDrag = dragRef.current;
      if (activeDrag) {
        const original = answerOrder(answersRef.current);
        const nextOrder = orderWithInsert(
          original,
          activeDrag.id,
          activeDrag.insertAt,
        );
        const changed = nextOrder.some((id, index) => id !== original[index]);
        if (changed) {
          onChangeRef.current(reorderByIds(answersRef.current, nextOrder));
        }
      }
      dragRef.current = null;
      pendingRef.current = null;
      setPending(null);
      setDrag(null);
    };

    const cancel = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      dragRef.current = null;
      pendingRef.current = null;
      setPending(null);
      setDrag(null);
    };

    window.addEventListener("pointermove", startOrMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("keydown", cancel);

    return () => {
      window.removeEventListener("pointermove", startOrMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("keydown", cancel);
    };
  }, [sessionActive]);

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
    onChange([...answers, { id: nextAnswerId(), content: `ans ${index}` }]);
  };

  const draggingAnswer = drag
    ? answers.find((answer) => answer.id === drag.id)
    : null;
  const others = drag
    ? answers.map((answer) => answer.id).filter((id) => id !== drag.id)
    : [];
  const dropBeforeId =
    drag && drag.insertAt < others.length ? others[drag.insertAt] : null;

  return (
    <>
      <BlockStack gap="200">
        <Text as="p" fontWeight="semibold">
          Answer(s)
        </Text>

        <BlockStack gap="200">
          {answers.flatMap((answer) => {
            const row = (
              <AnswerChoiceRow
                key={answer.id}
                answer={answer}
                dragging={drag?.id === answer.id}
                reorderActive={sessionActive}
                deleteDisabled={answers.length <= 1}
                onContentChange={(content) => patchAnswer(answer.id, content)}
                onDelete={() => deleteAnswer(answer.id)}
                onDragStart={(id, point) => {
                  setPending({ id, ...point });
                }}
                onRowRef={registerRow}
              />
            );

            if (dropBeforeId === answer.id) {
              return [<QuestionDropLine key={`drop-${answer.id}`} />, row];
            }

            return [row];
          })}
          {drag && dropBeforeId === null ? <QuestionDropLine /> : null}
        </BlockStack>

        <AddListRow label="Add answer" onClick={addAnswer} />
      </BlockStack>

      {drag && draggingAnswer ? (
        <AnswerDragPreview
          content={draggingAnswer.content}
          anchorLeft={
            rows.current.get(drag.id)?.getBoundingClientRect().left ?? drag.x
          }
          y={drag.y}
          width={
            rows.current.get(drag.id)?.getBoundingClientRect().width ?? 280
          }
        />
      ) : null}
    </>
  );
}
