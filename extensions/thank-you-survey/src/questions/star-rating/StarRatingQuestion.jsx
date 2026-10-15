import { useMemo, useState } from "preact/hooks";
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
  const [hoveredValue, setHoveredValue] = useState(null);

  const selectedValue = useMemo(() => {
    const selected = answers.find((answer) => answer.id === selectedAnswerId);
    if (!selected) {
      return null;
    }
    return parseStarRatingAnswerContent(selected.content);
  }, [answers, selectedAnswerId]);

  const locked = selectedValue != null;
  const emojiSource = locked ? selectedValue : hoveredValue;
  const emoji =
    emojiSource != null
      ? emojiForStarRatingValue(emojiSource)
      : STAR_RATING_DEFAULT_EMOJI;

  const highlightUpTo = locked
    ? (selectedValue ?? 0)
    : (hoveredValue ?? 0);

  const leftLabel = question.leftLabel?.trim() || DEFAULT_LABELS.left;
  const rightLabel = question.rightLabel?.trim() || DEFAULT_LABELS.right;

  return (
    <s-stack gap="base">
      <s-text color="subdued">{leftLabel}</s-text>

      <s-stack inlineAlignment="center">
        <s-text>{emoji}</s-text>
      </s-stack>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "4px",
        }}
      >
        {answers.map((answer) => {
          const value = parseStarRatingAnswerContent(answer.content);
          if (value == null) {
            return null;
          }
          const filled = highlightUpTo >= value;
          return (
            <button
              key={answer.id}
              type="button"
              aria-label={`${value} star`}
              onClick={() => onSelect(answer.id)}
              onMouseEnter={() => {
                if (!locked) {
                  setHoveredValue(value);
                }
              }}
              onMouseLeave={() => {
                if (!locked) {
                  setHoveredValue(null);
                }
              }}
              style={{
                margin: 0,
                padding: "4px",
                border: 0,
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "28px",
                lineHeight: 1,
                color: filled ? "#303030" : "#8a8a8a",
              }}
            >
              {filled ? STAR_FILLED : STAR_OUTLINE}
            </button>
          );
        })}
      </div>

      <s-stack inlineAlignment="end">
        <s-text color="subdued">{rightLabel}</s-text>
      </s-stack>
    </s-stack>
  );
}
