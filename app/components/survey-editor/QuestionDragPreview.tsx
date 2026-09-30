import { createPortal } from "react-dom";
import { truncateText } from "../../lib/truncate";
import styles from "./question-drag.module.css";

interface QuestionDragPreviewProps {
  title: string;
  x: number;
  y: number;
}

/**
 * Ghost of the question that follows the pointer during reorder.
 * Offset from the cursor so the list under the pointer can still rearrange.
 */
export function QuestionDragPreview({ title, x, y }: QuestionDragPreviewProps) {
  return createPortal(
    <div
      className={styles.preview}
      style={{ left: `${x + 16}px`, top: `${y + 8}px` }}
    >
      <s-box
        padding="small-200"
        background="base"
        border="base"
        borderRadius="base"
      >
        <s-stack direction="inline" gap="small-200" alignItems="center">
          <s-icon type="drag-handle" />
          <s-text>{truncateText(title)}</s-text>
        </s-stack>
      </s-box>
    </div>,
    document.body,
  );
}
