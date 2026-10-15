import { useMemo } from "preact/hooks";
import {
  emojiForStarRatingValue,
  parseStarRatingAnswerContent,
  STAR_RATING_DEFAULT_EMOJI,
} from "./star-rating-ui.js";

const STAR_OUTLINE = "☆";
const STAR_FILLED = "★";
const DEFAULT_LABELS = { left: "Hate it", right: "Love it" };

export function StarRatingQuestion({
  question,
  answers,
  selectedAnswerId,
  onSelect,
}) {
  const selectedValue = useMemo(() => {
    const selected = answers.find((answer) => answer.id === selectedAnswerId);
    if (!selected) {
      return null;
    }
    return parseStarRatingAnswerContent(selected.content);
  }, [answers, selectedAnswerId]);

  const emoji =
    selectedValue != null
      ? emojiForStarRatingValue(selectedValue)
      : STAR_RATING_DEFAULT_EMOJI;

  const highlightUpTo = selectedValue ?? 0;

  const leftLabel = question.leftLabel?.trim() || DEFAULT_LABELS.left;
  const rightLabel = question.rightLabel?.trim() || DEFAULT_LABELS.right;

  return (
    <s-grid gridTemplateColumns="1fr" gap="base">
      <s-text color="subdued">{leftLabel}</s-text>

      <s-grid gridTemplateColumns="1fr" justifyItems="center" padding="small">
        <s-box border="base" borderRadius="max" padding="large">
          <s-heading>{emoji}</s-heading>
        </s-box>
      </s-grid>

      <s-grid gridTemplateColumns="1fr" justifyItems="center">
        <s-grid gridTemplateColumns="repeat(5, auto)" gap="small">
          {answers.map((answer) => {
            const value = parseStarRatingAnswerContent(answer.content);
            if (value == null) {
              return null;
            }
            const filled = highlightUpTo >= value;
            return (
              <s-button
                key={answer.id}
                type="button"
                variant="secondary"
                accessibilityLabel={`${value} star`}
                onClick={() => onSelect(answer.id)}
              >
                {filled ? STAR_FILLED : STAR_OUTLINE}
              </s-button>
            );
          })}
        </s-grid>
      </s-grid>

      <s-grid gridTemplateColumns="1fr" justifyItems="end">
        <s-text color="subdued">{rightLabel}</s-text>
      </s-grid>
    </s-grid>
  );
}
