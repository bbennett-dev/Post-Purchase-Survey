import { useEffect, useRef, useState } from "react";
import { ActionList, Box, Popover } from "@shopify/polaris";
import { DeleteIcon, StarIcon } from "@shopify/polaris-icons";
import type { ThankYouContent } from "../../lib/survey/types";
import { endingTitle } from "../../lib/survey/questions";
import { EndingRowInner } from "./EndingRowInner";
import { QuestionRowMenuButton } from "./QuestionRowMenuButton";

interface EndingRowProps {
  card: ThankYouContent;
  index: number;
  selected: boolean;
  isRowHovered: boolean;
  title: string;
  onSelect: (id: string) => void;
  onSetMain: (id: string) => void;
  onDelete: (id: string) => void;
  onRowHover: (id: string) => void;
  onRowLeave: (id: string) => void;
}

/**
 * Ending list row — same shell and hover/selection as {@link QuestionRow}.
 */
export function EndingRow({
  card,
  index,
  selected,
  isRowHovered,
  title,
  onSelect,
  onSetMain,
  onDelete,
  onRowHover,
  onRowLeave,
}: EndingRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const id = card.id ?? `ending-${index}`;
  const isMain = card.isDefault === true;
  const showChrome = isRowHovered || menuOpen;
  const heading = title || endingTitle(card, index);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return;
    }

    const selectRow = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-stop-row-click]")) {
        return;
      }
      onSelect(id);
    };

    row.addEventListener("click", selectRow);

    return () => {
      row.removeEventListener("click", selectRow);
    };
  }, [id, onSelect]);

  const rowBackground = selected
    ? "bg-fill-brand"
    : showChrome
      ? "bg-surface-secondary"
      : undefined;

  const rowClassName = [
    "se-question-row",
    showChrome && !isMain ? "se-question-row--chrome" : "",
    isMain ? "se-ending-row--main" : "",
    isMain && selected ? "se-ending-row--main-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rowClassName}
      data-ending-id={id}
      ref={rowRef}
      onMouseEnter={() => onRowHover(id)}
      onMouseLeave={(event) => {
        const related = event.relatedTarget;
        if (related instanceof Node && rowRef.current?.contains(related)) {
          return;
        }
        onRowLeave(id);
      }}
    >
      <Box
        paddingInline="200"
        paddingBlock="150"
        borderRadius="200"
        background={rowBackground}
        color={selected ? "text-brand-on-bg-fill" : undefined}
        overflowX="hidden"
        overflowY="hidden"
      >
        <EndingRowInner
          title={heading}
          selected={selected}
          isMain={isMain}
          showMenuChrome={showChrome && !isMain}
          menu={
            !isMain ? (
              <div
                data-stop-row-click
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Popover
                  active={menuOpen}
                  activator={
                    <QuestionRowMenuButton
                      selected={selected}
                      open={menuOpen}
                      accessibilityLabel={`Actions for ${heading}`}
                      onClick={() => setMenuOpen((open) => !open)}
                    />
                  }
                  onClose={() => setMenuOpen(false)}
                >
                  <ActionList
                    items={[
                      {
                        content: "Set as main",
                        icon: StarIcon,
                        onAction: () => {
                          onSetMain(id);
                          setMenuOpen(false);
                        },
                      },
                      {
                        content: "Delete ending",
                        icon: DeleteIcon,
                        destructive: true,
                        onAction: () => {
                          onDelete(id);
                          setMenuOpen(false);
                        },
                      },
                    ]}
                  />
                </Popover>
              </div>
            ) : undefined
          }
        />
      </Box>
    </div>
  );
}
