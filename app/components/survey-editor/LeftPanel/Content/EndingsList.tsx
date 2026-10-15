import { useState } from "react";
import { BlockStack } from "@shopify/polaris";
import { endingTitle } from "../../../../lib/survey/questions";
import type { ThankYouContent } from "../../../../lib/survey/types";
import { EndingRow } from "../../EndingRow";
import { AddListRow } from "../AddListRow";

interface EndingsListProps {
  cards: ThankYouContent[];
  selectedEndingId: string | null;
  onSelectEnding: (id: string) => void;
  onAddEnding: () => void;
  onSetMain: (id: string) => void;
  onDeleteEnding: (id: string) => void;
}

/**
 * Thank-you / ending cards — compact list matching question row spacing.
 */
export function EndingsList({
  cards,
  selectedEndingId,
  onSelectEnding,
  onAddEnding,
  onSetMain,
  onDeleteEnding,
}: EndingsListProps) {
  const [hoveredEndingId, setHoveredEndingId] = useState<string | null>(null);

  return (
    <BlockStack gap="050">
      {cards.map((card, index) => {
        const id = card.id ?? `ending-${index}`;
        return (
          <EndingRow
            key={id}
            card={card}
            index={index}
            selected={id === selectedEndingId}
            isRowHovered={hoveredEndingId === id}
            title={endingTitle(card, index)}
            onSelect={onSelectEnding}
            onSetMain={onSetMain}
            onDelete={onDeleteEnding}
            onRowHover={setHoveredEndingId}
            onRowLeave={(endingId) =>
              setHoveredEndingId((current) =>
                current === endingId ? null : current,
              )
            }
          />
        );
      })}
      <AddListRow label="Add ending" onClick={onAddEnding} />
    </BlockStack>
  );
}
