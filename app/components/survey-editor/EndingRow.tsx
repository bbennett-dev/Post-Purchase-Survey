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
  title: string;
  onSelect: (id: string) => void;
  onSetMain: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Ending list row — same shell and hover/selection as {@link QuestionRow}.
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
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const id = card.id ?? `ending-${index}`;
  const isMain = card.isDefault === true;
  const showChrome = hovered || menuOpen;
  const heading = title || endingTitle(card, index);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return;
    }

    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    const selectRow = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-stop-row-click]")) {
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
    <div data-ending-id={id} ref={rowRef}>
      <Box
        paddingInline="200"
        paddingBlock="150"
        borderRadius="200"
        background={
          selected
            ? "bg-fill-brand"
            : showChrome
              ? "bg-surface-secondary"
              : undefined
        }
        color={selected ? "text-brand-on-bg-fill" : undefined}
        overflowX="hidden"
        overflowY="hidden"
      >
        <EndingRowInner
          title={heading}
          selected={selected}
          isMain={isMain}
          menuVisible={showChrome && !isMain}
          menu={
            <div
              data-stop-row-click
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Popover
                active={menuOpen}
                activator={
                  <QuestionRowMenuButton
                    selected={selected}
                    pressed={menuOpen}
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
          }
        />
      </Box>
    </div>
  );
}
