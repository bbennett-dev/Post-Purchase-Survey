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
 * Thank-you / ending cards list with one Main ending and add row.
 */
export function EndingsList({
  cards,
  selectedEndingId,
  onSelectEnding,
  onAddEnding,
  onSetMain,
  onDeleteEnding,
}: EndingsListProps) {
  return (
    <s-stack gap="small-200">
      {cards.map((card, index) => {
        const id = card.id ?? `ending-${index}`;
        return (
          <EndingRow
            key={id}
            card={card}
            index={index}
            selected={id === selectedEndingId}
            title={endingTitle(card, index)}
            onSelect={onSelectEnding}
            onSetMain={onSetMain}
            onDelete={onDeleteEnding}
          />
        );
      })}
      <AddListRow label="Add ending" onClick={onAddEnding} />
    </s-stack>
  );
}
