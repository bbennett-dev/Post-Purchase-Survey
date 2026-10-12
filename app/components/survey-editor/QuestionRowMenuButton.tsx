import { Icon } from "@shopify/polaris";
import { MenuHorizontalIcon } from "@shopify/polaris-icons";
import styles from "./question-row-menu.module.css";

interface QuestionRowMenuButtonProps {
  selected: boolean;
  /** Popover open — keep hover pill visible. */
  pressed: boolean;
  accessibilityLabel: string;
  onClick: () => void;
}

/** ⋯ activator sized to the question title line; hover bg works on brand and neutral rows. */
export function QuestionRowMenuButton({
  selected,
  pressed,
  accessibilityLabel,
  onClick,
}: QuestionRowMenuButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.menuButton} ${selected ? styles.menuButtonSelected : ""}`}
      aria-expanded={pressed}
      aria-haspopup="true"
      aria-label={accessibilityLabel}
      onClick={onClick}
    >
      <Icon
        source={MenuHorizontalIcon}
        tone={selected ? undefined : "subdued"}
      />
    </button>
  );
}
