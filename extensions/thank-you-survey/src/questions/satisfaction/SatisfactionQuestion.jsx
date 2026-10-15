import { useMemo } from "preact/hooks";
import {
  emojiForStarRatingValue,
  parseStarRatingAnswerContent,
} from "../star-rating/star-rating-ui.js";

export function SatisfactionQuestion({
  question,
  answers,
  selectedAnswerId,
  onSelect,
}) {
  const leftLabel = question.leftLabel?.trim() || "Not satisfied";
  const rightLabel = question.rightLabel?.trim() || "Very satisfied";

  const tiles = useMemo(
    () =>
      answers.map((answer) => {
        const value = parseStarRatingAnswerContent(answer.content);
        return {
          answer,
          value,
          face: value != null ? emojiForStarRatingValue(value) : "😑",
        };
      }),
    [answers],
  );

  return (
    <s-stack gap="base">
      <s-text color="subdued">{leftLabel}</s-text>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {tiles.map(({ answer, value, face }) => {
          const selected = selectedAnswerId === answer.id;
          return (
            <button
              key={answer.id}
              type="button"
              aria-label={`Satisfaction ${value ?? ""}`}
              onClick={() => onSelect(answer.id)}
              style={{
                margin: 0,
                width: "52px",
                height: "52px",
                padding: 0,
                border: selected ? "2px solid #005bd3" : "1px solid #d9d9d9",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                boxSizing: "border-box",
                borderRadius: "8px",
                background: selected ? "#f1f1f1" : "#fff",
                cursor: "pointer",
                fontSize: "28px",
                lineHeight: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {face}
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
