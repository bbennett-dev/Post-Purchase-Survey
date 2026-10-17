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
    <s-grid gridTemplateColumns="1fr" gap="base">
      <s-text color="subdued">{leftLabel}</s-text>

      <s-grid gridTemplateColumns="1fr" justifyItems="center">
        <s-grid gridTemplateColumns="repeat(5, auto)" gap="base">
          {tiles.map(({ answer, value, face }) => {
            const selected = selectedAnswerId === answer.id;
            return (
              <s-button
                key={answer.id}
                type="button"
                variant={selected ? "primary" : "secondary"}
                accessibilityLabel={`Satisfaction ${value ?? ""}`}
                onClick={() => onSelect(answer.id)}
              >
                {face}
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
