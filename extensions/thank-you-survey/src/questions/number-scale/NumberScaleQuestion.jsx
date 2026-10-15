import { useMemo, useState } from "preact/hooks";
import {
  emojiForNumberScaleValue,
  NUMBER_SCALE_DEFAULT_EMOJI,
  parseNumberScaleAnswerContent,
} from "./number-scale-ui.js";

export function NumberScaleQuestion({
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
    <s-stack gap="base">
      <s-text color="subdued">{leftLabel}</s-text>

      <s-stack inlineAlignment="center">
        <s-text>{emoji}</s-text>
      </s-stack>

      <div
        style={{
          display: "flex",
          width: "100%",
          gap: "1px",
          padding: "1px",
          boxSizing: "border-box",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#d9d9d9",
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
                background: selected ? "#f1f1f1" : "#fff",
                boxShadow: selected ? "inset 0 0 0 2px #005bd3" : "none",
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

      <s-stack inlineAlignment="end">
        <s-text color="subdued">{rightLabel}</s-text>
      </s-stack>
    </s-stack>
  );
}
