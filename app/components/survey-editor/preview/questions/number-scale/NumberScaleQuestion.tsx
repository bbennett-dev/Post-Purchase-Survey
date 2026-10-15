import { useMemo, useState } from "react";
import { Text } from "@shopify/polaris";
import { choiceAnswersForQuestion } from "../../../../../lib/survey/preview-survey-flow";
import {
  emojiForNumberScaleValue,
  NUMBER_SCALE_DEFAULT_EMOJI,
  parseNumberScaleAnswerContent,
} from "../../../../../lib/survey/number-scale-ui";
import type { SurveyQuestion } from "../../../../../lib/survey/types";

export interface NumberScaleQuestionProps {
  question: SurveyQuestion;
  selectedAnswerId: string | undefined;
  onSelect: (answerId: string) => void;
}

/**
 * 1–10 scale with hover emoji feedback (competitor parity).
 * Default face is neutral; selection locks the emoji for that bucket.
 */
export function NumberScaleQuestion({
  question,
  selectedAnswerId,
  onSelect,
}: NumberScaleQuestionProps) {
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
    return parseNumberScaleAnswerContent(selected.content);
  }, [answers, selectedAnswerId]);

  const locked = selectedValue != null;
  const activeValue = locked ? selectedValue : hoveredValue;
  const emoji =
    activeValue != null
      ? emojiForNumberScaleValue(activeValue)
      : NUMBER_SCALE_DEFAULT_EMOJI;

  const leftLabel = question.leftLabel?.trim() || "Not likely";
  const rightLabel = question.rightLabel?.trim() || "Very likely";

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
          width: "100%",
          gap: "1px",
          padding: "1px",
          boxSizing: "border-box",
          borderRadius: "var(--p-border-radius-200)",
          overflow: "hidden",
          background: "var(--p-color-border)",
        }}
      >
        {answers.map((answer) => {
          const value = parseNumberScaleAnswerContent(answer.content);
          const selected = selectedAnswerId === answer.id;
          return (
            <button
              key={answer.id}
              type="button"
              onClick={() => onSelect(answer.id)}
              onMouseEnter={() => {
                if (!locked && value != null) {
                  setHoveredValue(value);
                }
              }}
              onMouseLeave={() => {
                if (!locked) {
                  setHoveredValue(null);
                }
              }}
              style={{
                flex: 1,
                minWidth: 0,
                margin: 0,
                padding: "10px 0",
                border: 0,
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                boxSizing: "border-box",
                borderRadius: 0,
                background: selected
                  ? "var(--p-color-bg-surface-secondary)"
                  : "var(--p-color-bg-surface)",
                boxShadow: selected
                  ? "inset 0 0 0 2px var(--p-color-border-emphasis)"
                  : "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "inherit",
                color: "inherit",
              }}
            >
              {answer.content}
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
