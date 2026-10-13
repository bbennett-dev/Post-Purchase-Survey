import { Box, Button, Icon, InlineGrid, TextField } from "@shopify/polaris";
import { DeleteIcon, DragHandleIcon } from "@shopify/polaris-icons";
import type { CSSProperties } from "react";

export interface AnswerChoiceRowInnerProps {
  content: string;
  onContentChange?: (content: string) => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  /** Drag handle only — pointer listeners attach here. */
  handleRef?: (element: HTMLDivElement | null) => void;
  handleStyle?: CSSProperties;
  readOnly?: boolean;
}

/**
 * Shared answer row chrome (handle border, field, delete) for list rows and drag preview.
 */
export function AnswerChoiceRowInner({
  content,
  onContentChange,
  onDelete,
  deleteDisabled = false,
  handleRef,
  handleStyle,
  readOnly = false,
}: AnswerChoiceRowInnerProps) {
  return (
    <InlineGrid columns="auto minmax(0, 1fr) auto" gap="200" alignItems="center">
      <div ref={handleRef} style={handleStyle}>
        <Box
          padding="200"
          background="bg-fill-tertiary"
          borderWidth="025"
          borderColor="border"
          borderRadius="200"
        >
          <Icon source={DragHandleIcon} tone="subdued" />
        </Box>
      </div>
      <TextField
        label="Answer"
        labelHidden
        value={content}
        onChange={onContentChange}
        autoComplete="off"
        readOnly={readOnly}
      />
      <Button
        icon={DeleteIcon}
        tone="critical"
        accessibilityLabel={`Delete ${content || "answer"}`}
        disabled={deleteDisabled || readOnly}
        onClick={onDelete}
      />
    </InlineGrid>
  );
}
