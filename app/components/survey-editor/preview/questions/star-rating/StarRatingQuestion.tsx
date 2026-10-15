import { useMemo, useState } from "react";
import { Text } from "@shopify/polaris";
import { choiceAnswersForQuestion } from "../../../../../lib/survey/preview-survey-flow";
import { scaleEndpointLabels } from "../../../../../lib/survey/questions";
import {
  emojiForStarRatingValue,
  parseStarRatingAnswerContent,
  STAR_RATING_DEFAULT_EMOJI,
} from "../../../../../lib/survey/star-rating-ui";
import type { SurveyQuestion } from "../../../../../lib/survey/types";

const STAR_OUTLINE = "☆";
const STAR_FILLED = "★";

export interface StarRatingQuestionProps {
  question: SurveyQuestion;
  selectedAnswerId: string | undefined;
  onSelect: (answerId: string) => void;
}

/**
 * 5-star scale with hover emoji + progressive fill (competitor parity).
 */
export function StarRatingQuestion({
  question,
  selectedAnswerId,
  onSelect,
}: StarRatingQuestionProps) {
  const answers = useMemo(
    () => choiceAnswersForQuestion(question),
    [question],
  );
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

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

  const defaults = scaleEndpointLabels(question.type);
  const leftLabel = question.leftLabel?.trim() || defaults.leftLabel;
  const rightLabel = question.rightLabel?.trim() || defaults.rightLabel;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Text as="span" variant="bodySm" tone="subdued">
        {leftLabel}
      </Text>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingBlock: "4px",
        }}
        aria-hidden
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: "2px dashed var(--p-color-border)",
            fontSize: "40px",
            lineHeight: 1,
          }}
        >
          {emoji}
        </span>
      </div>

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
                color: filled
                  ? "var(--p-color-text)"
                  : "var(--p-color-text-secondary)",
              }}
            >
              {filled ? STAR_FILLED : STAR_OUTLINE}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Text as="span" variant="bodySm" tone="subdued">
          {rightLabel}
        </Text>
      </div>
    </div>
  );
}
