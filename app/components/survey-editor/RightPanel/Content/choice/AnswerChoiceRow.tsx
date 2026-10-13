import { useEffect, useRef } from "react";
import { Box } from "@shopify/polaris";
import type { SurveyAnswer } from "../../../../../lib/survey/types";
import { AnswerChoiceRowInner } from "./AnswerChoiceRowInner";

interface AnswerChoiceRowProps {
  answer: SurveyAnswer;
  dragging: boolean;
  reorderActive: boolean;
  deleteDisabled: boolean;
  onContentChange: (content: string) => void;
  onDelete: () => void;
  onDragStart: (id: string, point: { x: number; y: number }) => void;
  onRowRef: (id: string, element: HTMLElement | null) => void;
}

/**
 * Choice answer list row — pointer drag from bordered handle (matches question list pattern).
 */
export function AnswerChoiceRow({
  answer,
  dragging,
  reorderActive,
  deleteDisabled,
  onContentChange,
  onDelete,
  onDragStart,
  onRowRef,
}: AnswerChoiceRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const row = rowRef.current;
    const handle = handleRef.current;
    if (!row || !handle) {
      return;
    }

    const startDrag = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      onDragStart(answer.id, { x: event.clientX, y: event.clientY });
    };

    handle.addEventListener("pointerdown", startDrag);
    onRowRef(answer.id, row);

    return () => {
      handle.removeEventListener("pointerdown", startDrag);
      onRowRef(answer.id, null);
    };
  }, [answer.id, onDragStart, onRowRef]);

  const handleCursor = reorderActive
    ? dragging
      ? "grabbing"
      : "grab"
    : dragging
      ? "grabbing"
      : "grab";

  return (
    <div ref={rowRef} data-answer-id={answer.id}>
      <Box
        padding="100"
        background="bg-surface-secondary"
        borderRadius="200"
        opacity={dragging ? "0.35" : undefined}
      >
        <AnswerChoiceRowInner
          content={answer.content}
          onContentChange={onContentChange}
          onDelete={onDelete}
          deleteDisabled={deleteDisabled}
          handleRef={(element) => {
            handleRef.current = element;
          }}
          handleStyle={{ cursor: handleCursor }}
        />
      </Box>
    </div>
  );
}
