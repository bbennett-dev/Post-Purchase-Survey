import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Box } from "@shopify/polaris";
import type { QuestionType } from "../../lib/survey/types";
import { QuestionRowInner } from "./QuestionRowInner";

interface QuestionDragPreviewProps {
  title: string;
  questionType: QuestionType;
  selected: boolean;
  /** Left edge of the source row — keeps ghost aligned with the list column. */
  anchorLeft: number;
  y: number;
  width: number;
}

/** Ghost row: same inner layout as {@link QuestionRow}, Y follows pointer, X locked to list. */
const floatingPosition = (
  anchorLeft: number,
  y: number,
  width: number,
): CSSProperties => ({
  position: "fixed",
  left: anchorLeft,
  top: y,
  width,
  transform: "translateY(-50%)",
  pointerEvents: "none",
  zIndex: 1000,
  boxSizing: "border-box",
});

export function QuestionDragPreview({
  title,
  questionType,
  selected,
  anchorLeft,
  y,
  width,
}: QuestionDragPreviewProps) {
  return createPortal(
    <div style={floatingPosition(anchorLeft, y, width)}>
      <Box
        paddingInline="200"
        paddingBlock="150"
        background="bg-fill-brand"
        color="text-brand-on-bg-fill"
        borderRadius="200"
        shadow="400"
      >
        <QuestionRowInner
          title={title}
          showHandle
          questionType={questionType}
          selected={selected}
          interactive
          dragging
        />
      </Box>
    </div>,
    document.body,
  );
}
