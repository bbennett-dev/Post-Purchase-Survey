import { useCallback, useEffect, useRef, useState } from "react";
import { ActionList, BlockStack, Text } from "@shopify/polaris";
import { questionTypesForEditor } from "../../../../lib/survey/questions";
import type { QuestionType, SurveyQuestion } from "../../../../lib/survey/types";
import { questionTypeIconSource } from "../../questionTypeIcons";
import { QuestionDragPreview } from "../../QuestionDragPreview";
import { QuestionDropLine } from "../../QuestionDropLine";
import { QuestionRow } from "../../QuestionRow";
import { useQuestionDragCursor } from "../../useEditorViewport";
import { AddListRow } from "../AddListRow";
import {
  DRAG_THRESHOLD,
  insertAtFromPoint,
  orderWithInsert,
  questionOrder,
  type DragSession,
} from "./questionDrag";

interface QuestionListProps {
  questions: SurveyQuestion[];
  selectedQuestionId: string;
  onSelectQuestion: (id: string) => void;
  onMoveQuestion: (id: string, direction: -1 | 1) => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestion: (order: string[]) => void;
  onAddQuestion: (type: QuestionType) => void;
}

/**
 * Draggable question list with drop indicator and add-content menu.
 */
export function QuestionList({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onMoveQuestion,
  onDeleteQuestion,
  onReorderQuestion,
  onAddQuestion,
}: QuestionListProps) {
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(
    null,
  );
  const [pending, setPending] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [drag, setDrag] = useState<DragSession | null>(null);
  const rows = useRef(new Map<string, HTMLElement>());
  const dragRef = useRef<DragSession | null>(null);
  const pendingRef = useRef(pending);
  const questionsRef = useRef(questions);
  const reorderRef = useRef(onReorderQuestion);
  const sessionActive = pending !== null || drag !== null;
  useQuestionDragCursor(sessionActive);

  pendingRef.current = pending;
  dragRef.current = drag;
  questionsRef.current = questions;
  reorderRef.current = onReorderQuestion;

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

        const original = questionOrder(questionsRef.current);
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

      const original = questionOrder(questionsRef.current);
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
        const original = questionOrder(questionsRef.current);
        const nextOrder = orderWithInsert(
          original,
          activeDrag.id,
          activeDrag.insertAt,
        );
        const changed = nextOrder.some((id, index) => id !== original[index]);
        if (changed) {
          reorderRef.current(nextOrder);
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

  const addContentRow = (
    <AddListRow
      label="Add content"
      menu={({ close }) => (
        <ActionList
          items={questionTypesForEditor().map((item) => ({
            content: item.label,
            icon: questionTypeIconSource(item.type),
            onAction: () => {
              close();
              onAddQuestion(item.type);
            },
          }))}
        />
      )}
    />
  );

  if (questions.length === 0) {
    return (
      <BlockStack gap="200">
        <Text as="p" tone="subdued">
          No questions yet.
        </Text>
        {addContentRow}
      </BlockStack>
    );
  }

  const draggingQuestion = drag
    ? questions.find((question) => question.id === drag.id)
    : null;
  const others = drag
    ? questions.map((question) => question.id).filter((id) => id !== drag.id)
    : [];
  const dropBeforeId =
    drag && drag.insertAt < others.length ? others[drag.insertAt] : null;

  return (
    <>
      <BlockStack gap="050">
        {questions.flatMap((question, index) => {
          const row = (
            <QuestionRow
              key={question.id}
              question={question}
              selected={question.id === selectedQuestionId}
              isRowHovered={hoveredQuestionId === question.id}
              dragging={drag?.id === question.id}
              reorderActive={sessionActive}
              isFirst={index === 0}
              isLast={index === questions.length - 1}
              onSelect={onSelectQuestion}
              onMove={onMoveQuestion}
              onDelete={onDeleteQuestion}
              onDragStart={(id, point) => {
                setPending({ id, ...point });
              }}
              onRowRef={registerRow}
              onRowHover={setHoveredQuestionId}
              onRowLeave={(id) =>
                setHoveredQuestionId((current) =>
                  current === id ? null : current,
                )
              }
            />
          );

          if (dropBeforeId === question.id) {
            return [<QuestionDropLine key={`drop-${question.id}`} />, row];
          }

          return [row];
        })}
        {drag && dropBeforeId === null ? <QuestionDropLine /> : null}
        {addContentRow}
      </BlockStack>
      {drag && draggingQuestion ? (
        <QuestionDragPreview
          title={draggingQuestion.heading || "Untitled question"}
          questionType={draggingQuestion.type}
          selected={draggingQuestion.id === selectedQuestionId}
          anchorLeft={
            rows.current.get(drag.id)?.getBoundingClientRect().left ?? drag.x
          }
          y={drag.y}
          width={
            rows.current.get(drag.id)?.getBoundingClientRect().width ?? 240
          }
        />
      ) : null}
    </>
  );
}
