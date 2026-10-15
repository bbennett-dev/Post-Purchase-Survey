import { Icon, UnstyledButton } from "@shopify/polaris";
import { MenuHorizontalIcon } from "@shopify/polaris-icons";

interface QuestionRowMenuButtonProps {
  selected: boolean;
  /** Popover open — keep hover pill visible. */
  open: boolean;
  accessibilityLabel: string;
  onClick: () => void;
}

/** ⋯ activator sized to the question title line; hover bg works on brand and neutral rows. */
export function QuestionRowMenuButton({
  selected,
  open,
  accessibilityLabel,
  onClick,
}: QuestionRowMenuButtonProps) {
  return (
    <UnstyledButton
      className={`se-menu-button${selected ? " se-menu-button--selected" : ""}`}
      ariaExpanded={open}
      accessibilityLabel={accessibilityLabel}
      onClick={onClick}
    >
      <Icon
        source={MenuHorizontalIcon}
        tone={selected ? undefined : "subdued"}
      />
    </UnstyledButton>
  );
}
