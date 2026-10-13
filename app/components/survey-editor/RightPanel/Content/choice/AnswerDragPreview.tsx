import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Box } from "@shopify/polaris";
import { AnswerChoiceRowInner } from "./AnswerChoiceRowInner";

interface AnswerDragPreviewProps {
  content: string;
  anchorLeft: number;
  y: number;
  width: number;
}

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

/** Floating ghost row — same bordered handle chrome as the list row. */
export function AnswerDragPreview({
  content,
  anchorLeft,
  y,
  width,
}: AnswerDragPreviewProps) {
  return createPortal(
    <div style={floatingPosition(anchorLeft, y, width)}>
      <Box
        padding="100"
        background="bg-surface-secondary"
        borderRadius="200"
        shadow="400"
      >
        <AnswerChoiceRowInner content={content} readOnly />
      </Box>
    </div>,
    document.body,
  );
}
