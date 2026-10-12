import { useState, type ReactNode } from "react";
import { Box, Icon, Popover } from "@shopify/polaris";
import { PlusCircleIcon } from "@shopify/polaris-icons";
import styles from "./add-list-row.module.css";

interface AddListRowProps {
  label: string;
  onClick?: () => void;
  menu?: ReactNode;
}

/**
 * Footer list row: same shell as {@link QuestionRow} (hover grey pill), blue add label, not draggable.
 */
export function AddListRow({ label, onClick, menu }: AddListRowProps) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const showChrome = hovered || open;

  const rowBody = (
    <Box
      paddingInline="200"
      paddingBlock="150"
      borderRadius="200"
      background={showChrome ? "bg-surface-secondary" : undefined}
    >
      <div className={styles.addRowInner}>
        <span className={styles.addIcon}>
          <Icon source={PlusCircleIcon} tone="interactive" />
        </span>
        <span className={styles.addLabel}>{label}</span>
        <span className={styles.addMenuSpacer} aria-hidden />
      </div>
    </Box>
  );

  const activator = (
    <button
      type="button"
      className={styles.addButton}
      aria-expanded={menu ? open : undefined}
      aria-haspopup={menu ? "true" : undefined}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => {
        if (menu) {
          setOpen((value) => !value);
          return;
        }
        onClick?.();
      }}
    >
      {rowBody}
    </button>
  );

  if (!menu) {
    return activator;
  }

  return (
    <Popover
      active={open}
      activator={activator}
      onClose={() => {
        setOpen(false);
        setHovered(false);
      }}
    >
      {menu}
    </Popover>
  );
}
