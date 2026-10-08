import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ThankYouContent } from "../../lib/survey/types";
import { truncateText } from "../../lib/truncate";
import styles from "./question-drag.module.css";

interface EndingRowProps {
  card: ThankYouContent;
  index: number;
  selected: boolean;
  title: string;
  onSelect: (id: string) => void;
  onSetMain: (id: string) => void;
  onDelete: (id: string) => void;
}

function SelectedTone({
  selected,
  children,
}: {
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={selected ? styles.selectedTone : undefined}
      style={
        selected
          ? { color: "#fff", filter: "brightness(0) invert(1)" }
          : undefined
      }
    >
      {children}
    </span>
  );
}

function rowBackground(
  selected: boolean,
  hovered: boolean,
  isMain: boolean,
): "subdued" | "transparent" {
  if (selected) {
    return "transparent";
  }
  if (hovered || isMain) {
    return "subdued";
  }
  return "transparent";
}

/**
 * Ending row for the content list.
 * Matches the question row layout: type icon, truncated title, optional
 * Main badge, and hover actions. Only one ending is Main; that ending has
 * no delete action. Non-main endings can Set as main or Delete.
 */
export function EndingRow({
  card,
  index,
  selected,
  title,
  onSelect,
  onSetMain,
  onDelete,
}: EndingRowProps) {
  const [hovered, setHovered] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const id = card.id ?? `ending-${index}`;
  const menuId = `ending-menu-${id}`;
  const isMain = card.isDefault === true;
  const showChrome = hovered || selected;
  const label = truncateText(title);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return;
    }

    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    const selectRow = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("s-button, s-menu")) {
        return;
      }
      onSelect(id);
    };

    row.addEventListener("pointerenter", enter);
    row.addEventListener("pointerleave", leave);
    row.addEventListener("click", selectRow);

    return () => {
      row.removeEventListener("pointerenter", enter);
      row.removeEventListener("pointerleave", leave);
      row.removeEventListener("click", selectRow);
    };
  }, [id, onSelect]);

  return (
    <div
      className={selected ? `${styles.row} ${styles.rowSelected}` : styles.row}
      data-ending-id={id}
      ref={(element) => {
        rowRef.current = element;
      }}
    >
      <s-box
        padding="none small-300 none none"
        background={rowBackground(selected, hovered, isMain)}
        borderRadius="base"
        overflow="hidden"
      >
        <s-grid
          gridTemplateColumns={
            isMain
              ? "auto minmax(0, 1fr) auto auto"
              : "auto minmax(0, 1fr) auto"
          }
          gap="small-200"
          alignItems="center"
        >
          <s-box padding="small-200" accessibilityLabel={title}>
            <SelectedTone selected={selected}>
              <s-icon type="cursor" />
            </SelectedTone>
          </s-box>
          <span className={styles.title}>
            <SelectedTone selected={selected}>
              <s-text>{label}</s-text>
            </SelectedTone>
          </span>
          {isMain ? (
            <SelectedTone selected={selected}>
              <s-badge>Main</s-badge>
            </SelectedTone>
          ) : null}
          {showChrome && !isMain ? (
            <SelectedTone selected={selected}>
              <s-button
                icon="menu-horizontal"
                variant="tertiary"
                accessibilityLabel={`Actions for ${title}`}
                commandFor={menuId}
              />
            </SelectedTone>
          ) : (
            <s-text />
          )}
        </s-grid>
        {!isMain ? (
          <s-menu id={menuId} accessibilityLabel={`${title} actions`}>
            <s-button icon="star" onClick={() => onSetMain(id)}>
              Set as main
            </s-button>
            <s-button
              icon="delete"
              tone="critical"
              onClick={() => onDelete(id)}
            >
              Delete ending
            </s-button>
          </s-menu>
        ) : null}
      </s-box>
    </div>
  );
}
