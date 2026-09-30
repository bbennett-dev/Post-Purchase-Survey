import { useEffect, useRef, useState, type ReactNode } from "react";
import { questionIcon } from "../../lib/survey/questions";
import type { SurveyQuestion } from "../../lib/survey/types";
import { truncateText } from "../../lib/truncate";
import styles from "./question-drag.module.css";

interface QuestionRowProps {
  question: SurveyQuestion;
  selected: boolean;
  dragging: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string, point: { x: number; y: number }) => void;
  onRowRef: (id: string, element: HTMLElement | null) => void;
}

function SelectedTone({
  selected,
  children,
}: {
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={selected ? styles.selectedTone : undefined}
      style={
        selected
          ? { color: "#fff", filter: "brightness(0) invert(1)" }
          : undefined
      }
    >
      {children}
    </span>
  );
}

function rowBackground(
  selected: boolean,
  hovered: boolean,
): "subdued" | "transparent" {
  if (selected) {
    return "transparent";
  }
  if (hovered) {
    return "subdued";
  }
  return "transparent";
}

/**
 * Question row for the content list.
 * Resting state is type icon and title. Hover shows a grey fill, replaces
 * the type icon with a grab-cursor drag handle, and reveals the action menu.
 * The selected question uses the brand-blue fill from the list pattern.
 * Polaris s-box only offers transparent|base|subdued|strong, so the
 * active color is applied on the row host. The faded placeholder stays
 * in the list while a ghost follows the pointer.
 */
export function QuestionRow({
  question,
  selected,
  dragging,
  isFirst,
  isLast,
  onSelect,
  onMove,
  onDelete,
  onDragStart,
  onRowRef,
}: QuestionRowProps) {
  const [hovered, setHovered] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLElement | null>(null);
  const menuId = `question-menu-${question.id}`;
  const showChrome = hovered || dragging;
  const heading = question.heading || "Untitled question";
  const title = truncateText(heading);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return;
    }

    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    const selectRow = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("s-button, s-menu")) {
        return;
      }
      onSelect(question.id);
    };

    row.addEventListener("pointerenter", enter);
    row.addEventListener("pointerleave", leave);
    row.addEventListener("click", selectRow);
    onRowRef(question.id, row);

    return () => {
      row.removeEventListener("pointerenter", enter);
      row.removeEventListener("pointerleave", leave);
      row.removeEventListener("click", selectRow);
      onRowRef(question.id, null);
    };
  }, [onRowRef, onSelect, question.id]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return;
    }

    row.style.opacity = dragging ? "0.4" : "";
    return () => {
      row.style.opacity = "";
    };
  }, [dragging]);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle || !showChrome) {
      return;
    }

    handle.style.cursor = "grab";

    const startDrag = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      handle.style.cursor = "grabbing";
      onDragStart(question.id, { x: event.clientX, y: event.clientY });
    };

    handle.addEventListener("pointerdown", startDrag);
    return () => {
      handle.style.cursor = "";
      handle.removeEventListener("pointerdown", startDrag);
    };
  }, [onDragStart, question.id, showChrome]);

  return (
    <div
      className={selected ? `${styles.row} ${styles.rowSelected}` : styles.row}
      data-question-id={question.id}
      ref={(element) => {
        rowRef.current = element;
      }}
    >
    <s-box
      padding="none small-300 none none"
      background={rowBackground(selected, hovered)}
      borderRadius="base"
      overflow="hidden"
    >
      <s-grid
        gridTemplateColumns="auto minmax(0, 1fr) auto"
        gap="small-200"
        alignItems="center"
      >
        <s-box
          padding="small-200"
          accessibilityLabel={
            showChrome ? `Drag ${heading}` : heading
          }
          ref={(element) => {
            handleRef.current = element;
          }}
        >
          <SelectedTone selected={selected}>
            <s-icon
              type={showChrome ? "drag-handle" : questionIcon(question.type)}
            />
          </SelectedTone>
        </s-box>
        <SelectedTone selected={selected}>
          <s-text>{title}</s-text>
        </SelectedTone>
        {showChrome ? (
          <SelectedTone selected={selected}>
            <s-button
              icon="menu-horizontal"
              variant="tertiary"
              accessibilityLabel={`Actions for ${heading}`}
              commandFor={menuId}
            />
          </SelectedTone>
        ) : (
          <s-text />
        )}
      </s-grid>
      <s-menu id={menuId} accessibilityLabel={`${heading} actions`}>
        <s-button
          icon="arrow-up"
          disabled={isFirst}
          onClick={() => onMove(question.id, -1)}
        >
          Move up
        </s-button>
        <s-button
          icon="arrow-down"
          disabled={isLast}
          onClick={() => onMove(question.id, 1)}
        >
          Move down
        </s-button>
        <s-button
          icon="delete"
          tone="critical"
          onClick={() => onDelete(question.id)}
        >
          Delete question
        </s-button>
      </s-menu>
    </s-box>
    </div>
  );
}
