import { useMemo } from "react";
import { Text } from "@shopify/polaris";
import { choiceAnswersForQuestion } from "../../../../../lib/survey/preview-survey-flow";
import { scaleEndpointLabels } from "../../../../../lib/survey/questions";
import {
  emojiForStarRatingValue,
  parseStarRatingAnswerContent,
} from "../../../../../lib/survey/star-rating-ui";
import type { SurveyQuestion } from "../../../../../lib/survey/types";

export interface SatisfactionQuestionProps {
  question: SurveyQuestion;
  selectedAnswerId: string | undefined;
  onSelect: (answerId: string) => void;
}

/**
 * Five emoji tiles (competitor satisfaction) — pick one face directly.
 */
export function SatisfactionQuestion({
  question,
  selectedAnswerId,
  onSelect,
}: SatisfactionQuestionProps) {
  const answers = useMemo(
    () => choiceAnswersForQuestion(question),
    [question],
  );

  const defaults = scaleEndpointLabels("satisfaction");
  const leftLabel = question.leftLabel?.trim() || defaults.leftLabel;
  const rightLabel = question.rightLabel?.trim() || defaults.rightLabel;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Text as="span" variant="bodySm" tone="subdued">
        {leftLabel}
      </Text>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {answers.map((answer) => {
          const value = parseStarRatingAnswerContent(answer.content);
          const selected = selectedAnswerId === answer.id;
          const face =
            value != null ? emojiForStarRatingValue(value) : "😑";
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
                border: selected
                  ? "2px solid var(--p-color-border-emphasis)"
                  : "1px solid var(--p-color-border)",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                boxSizing: "border-box",
                borderRadius: "var(--p-border-radius-200)",
                background: selected
                  ? "var(--p-color-bg-surface-secondary)"
                  : "var(--p-color-bg-surface)",
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

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Text as="span" variant="bodySm" tone="subdued">
          {rightLabel}
        </Text>
      </div>
    </div>
  );
}
