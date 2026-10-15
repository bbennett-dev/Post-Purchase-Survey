import { Icon, Text } from "@shopify/polaris";
import { DragHandleIcon } from "@shopify/polaris-icons";
import type { ReactNode } from "react";
import type { QuestionType } from "../../lib/survey/types";
import { truncateText } from "../../lib/truncate";
import { QuestionTypeIcon } from "./QuestionTypeIcon";

/** Matches Polaris `space-200` gap between leading icon, title, and menu. */
const ROW_GAP = "var(--p-space-200)";
const LEADING_WIDTH = 20;
/** bodySm cap height — keeps handle, title, and ⋯ on one optical line. */
export const QUESTION_ROW_LINE_HEIGHT = 20;
export const QUESTION_ROW_MENU_SLOT_WIDTH = 28;

interface QuestionRowInnerProps {
  title: string;
  /** When true, show 6-dot handle instead of question-type icon. */
  showHandle: boolean;
  questionType: QuestionType;
  selected?: boolean;
  /** Reserved width for ⋮ so title stays aligned with list rows during drag preview. */
  menu?: ReactNode;
  /** Row is hovered (draggable chrome visible). */
  interactive?: boolean;
  /** This row is the active drag source. */
  dragging?: boolean;
  /** Any row in the list is mid reorder — defer to document `grabbing`. */
  reorderActive?: boolean;
}

/**
 * Shared horizontal layout for list rows and the drag ghost so icon/title do not shift.
 */
export function QuestionRowInner({
  title,
  showHandle,
  questionType,
  selected = false,
  menu,
  interactive = false,
  dragging = false,
  reorderActive = false,
}: QuestionRowInnerProps) {
  const displayTitle = truncateText(title, 32);
  const iconTone = selected ? undefined : "subdued";

  /** One-finger hand on the row; grab/grabbing only on the 6-dot handle (competitor). */
  const rowCursor = reorderActive
    ? dragging
      ? "grabbing"
      : undefined
    : dragging
      ? "grabbing"
      : interactive
        ? "pointer"
        : undefined;
  const handleCursor =
    showHandle && interactive
      ? reorderActive || dragging
        ? "grabbing"
        : "grab"
      : undefined;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: ROW_GAP,
        width: "100%",
        minWidth: 0,
        cursor: rowCursor,
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: LEADING_WIDTH,
          minWidth: LEADING_WIDTH,
          height: QUESTION_ROW_LINE_HEIGHT,
          flexShrink: 0,
          cursor: handleCursor,
        }}
        aria-hidden
      >
        {showHandle ? (
          <Icon
            source={DragHandleIcon}
            tone={selected ? undefined : "subdued"}
          />
        ) : (
          <QuestionTypeIcon type={questionType} tone={iconTone} />
        )}
      </span>
      <div
        style={{
          minWidth: 0,
          flex: "1 1 auto",
          display: "flex",
          alignItems: "center",
          height: QUESTION_ROW_LINE_HEIGHT,
        }}
      >
        <Text
          as="span"
          variant="bodySm"
          truncate
          fontWeight={selected ? "medium" : "regular"}
        >
          {displayTitle}
        </Text>
      </div>
      <div
        className="se-menu-slot"
        style={{
          width: QUESTION_ROW_MENU_SLOT_WIDTH,
          minWidth: QUESTION_ROW_MENU_SLOT_WIDTH,
          height: QUESTION_ROW_LINE_HEIGHT,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {menu}
      </div>
    </div>
  );
}
