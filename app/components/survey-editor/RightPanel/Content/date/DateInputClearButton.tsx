import type { MouseEvent } from "react";
import { UnstyledButton } from "@shopify/polaris";
import styles from "./date-input-clear-button.module.css";

export interface DateInputClearButtonProps {
  accessibilityLabel: string;
  onClear: () => void;
}

/**
 * In-field clear control (competitor: dark circle + white × inside the date input).
 * Plain SVG × so fill stays visible on `--p-color-bg-inverse` (Polaris Icon inherit is unreliable here).
 */
export function DateInputClearButton({
  accessibilityLabel,
  onClear,
}: DateInputClearButtonProps) {
  return (
    <UnstyledButton
      className={styles.clearButton}
      accessibilityLabel={accessibilityLabel}
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={() => {
        onClear();
      }}
    >
      <svg
        className={styles.clearIcon}
        viewBox="0 0 20 20"
        aria-hidden
        focusable="false"
      >
        <path d="M11.414 10l4.293-4.293a1 1 0 10-1.414-1.414L10 8.586 5.707 4.293a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 101.414 1.414L10 11.414l4.293 4.293a1 1 0 001.414-1.414L11.414 10z" />
      </svg>
    </UnstyledButton>
  );
}
