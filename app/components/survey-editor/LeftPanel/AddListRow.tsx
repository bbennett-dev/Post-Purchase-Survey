import type { ReactNode } from "react";

interface AddListRowProps {
  label: string;
  commandFor?: string;
  onClick?: () => void;
  menu?: ReactNode;
}

/**
 * Last row in a content list. Same icon + label layout as a question,
 * using clickable + info tone so it stays blue text, not a button.
 */
export function AddListRow({
  label,
  commandFor,
  onClick,
  menu,
}: AddListRowProps) {
  return (
    <>
      <s-clickable
        padding="none small-300 none none"
        borderRadius="base"
        commandFor={commandFor}
        onClick={onClick}
      >
        <s-grid
          gridTemplateColumns="auto minmax(0, 1fr)"
          gap="small-200"
          alignItems="center"
        >
          <s-box padding="small-200">
            <s-icon type="plus" tone="info" />
          </s-box>
          <s-text tone="info">{label}</s-text>
        </s-grid>
      </s-clickable>
      {menu}
    </>
  );
}
