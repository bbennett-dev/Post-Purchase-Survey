import { useEffect, useRef, useState } from "react";
import { ActionList, Box, Popover } from "@shopify/polaris";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
} from "@shopify/polaris-icons";
import type { SurveyQuestion } from "../../lib/survey/types";
import { QuestionRowInner } from "./QuestionRowInner";
import { QuestionRowMenuButton } from "./QuestionRowMenuButton";

interface QuestionRowProps {
  question: SurveyQuestion;
  selected: boolean;
  isRowHovered: boolean;
  dragging: boolean;
  reorderActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string, point: { x: number; y: number }) => void;
  onRowRef: (id: string, element: HTMLElement | null) => void;
  onRowHover: (id: string) => void;
  onRowLeave: (id: string) => void;
}

/**
 * Content list row: hover shows 6-dot handle + ⋮; whole row starts drag except ⋮.
 */
export function QuestionRow({
  question,
  selected,
  isRowHovered,
  dragging,
  reorderActive,
  isFirst,
  isLast,
  onSelect,
  onMove,
  onDelete,
  onDragStart,
  onRowRef,
  onRowHover,
  onRowLeave,
}: QuestionRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const interactiveRef = useRef(false);

  const showChrome = isRowHovered || menuOpen;
  /** Keep handle visible on the faded source row while dragging. */
  const showHandle = showChrome || dragging;
  const heading = question.heading || "Untitled question";

  interactiveRef.current = showChrome;

  useEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return;
    }

    const selectRow = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-stop-row-click]")) {
        return;
      }
      onSelect(question.id);
    };

    const startDrag = (event: PointerEvent) => {
      if (event.button !== 0 || !interactiveRef.current) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-stop-row-click]")) {
        return;
      }
      onDragStart(question.id, { x: event.clientX, y: event.clientY });
    };

    row.addEventListener("click", selectRow);
    row.addEventListener("pointerdown", startDrag);
    onRowRef(question.id, row);

    return () => {
      row.removeEventListener("click", selectRow);
      row.removeEventListener("pointerdown", startDrag);
      onRowRef(question.id, null);
    };
  }, [onDragStart, onRowRef, onSelect, question.id]);

  return (
    <div
      className={`se-question-row${showChrome ? " se-question-row--chrome" : ""}`}
      data-question-id={question.id}
      ref={rowRef}
      onMouseEnter={() => onRowHover(question.id)}
      onMouseLeave={(event) => {
        const related = event.relatedTarget;
        if (related instanceof Node && rowRef.current?.contains(related)) {
          return;
        }
        onRowLeave(question.id);
      }}
    >
      <Box
        paddingInline="200"
        paddingBlock="150"
        borderRadius="200"
        background={
          selected
            ? "bg-fill-brand"
            : showChrome
              ? "bg-surface-secondary"
              : undefined
        }
        color={selected ? "text-brand-on-bg-fill" : undefined}
        opacity={dragging ? "0.35" : undefined}
        overflowX="hidden"
        overflowY="hidden"
      >
        <QuestionRowInner
          title={heading}
          showHandle={showHandle}
          questionType={question.type}
          selected={selected}
          interactive={showChrome}
          dragging={dragging}
          reorderActive={reorderActive}
          menu={
            <div
              data-stop-row-click
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Popover
                active={menuOpen}
                activator={
                  <QuestionRowMenuButton
                    selected={selected}
                    open={menuOpen}
                    accessibilityLabel={`Actions for ${heading}`}
                    onClick={() => setMenuOpen((open) => !open)}
                  />
                }
                onClose={() => setMenuOpen(false)}
              >
                <ActionList
                  items={[
                    {
                      content: "Move up",
                      icon: ArrowUpIcon,
                      disabled: isFirst,
                      onAction: () => {
                        onMove(question.id, -1);
                        setMenuOpen(false);
                      },
                    },
                    {
                      content: "Move down",
                      icon: ArrowDownIcon,
                      disabled: isLast,
                      onAction: () => {
                        onMove(question.id, 1);
                        setMenuOpen(false);
                      },
                    },
                    {
                      content: "Delete question",
                      icon: DeleteIcon,
                      destructive: true,
                      onAction: () => {
                        onDelete(question.id);
                        setMenuOpen(false);
                      },
                    },
                  ]}
                />
              </Popover>
            </div>
          }
        />
      </Box>
    </div>
  );
}
