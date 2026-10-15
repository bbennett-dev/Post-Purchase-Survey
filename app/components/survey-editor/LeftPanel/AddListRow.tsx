import { useState, type ReactNode } from "react";
import { Box, Icon, Popover, UnstyledButton } from "@shopify/polaris";
import { PlusCircleIcon } from "@shopify/polaris-icons";

export interface AddListRowMenuHelpers {
  close: () => void;
}

interface AddListRowProps {
  label: string;
  onClick?: () => void;
  menu?: ReactNode | ((helpers: AddListRowMenuHelpers) => ReactNode);
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
      <div className="se-add-row-inner">
        <span className="se-add-icon">
          <Icon source={PlusCircleIcon} tone="interactive" />
        </span>
        <span className="se-add-label">{label}</span>
        <span className="se-add-menu-spacer" aria-hidden />
      </div>
    </Box>
  );

  const activator = (
    <UnstyledButton
      className="se-add-button"
      ariaExpanded={menu ? open : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (menu) {
          setOpen((value) => !value);
          return;
        }
        onClick?.();
      }}
    >
      {rowBody}
    </UnstyledButton>
  );

  if (!menu) {
    return activator;
  }

  const closeMenu = () => {
    setOpen(false);
    setHovered(false);
  };

  const menuContent =
    typeof menu === "function" ? menu({ close: closeMenu }) : menu;

  return (
    <Popover active={open} activator={activator} onClose={closeMenu}>
      {menuContent}
    </Popover>
  );
}
