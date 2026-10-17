import { useMemo } from "preact/hooks";
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
  const selectedValue = useMemo(() => {
    const selected = answers.find((answer) => answer.id === selectedAnswerId);
    if (!selected) {
      return null;
    }
    return parseNumberScaleAnswerContent(selected.content);
  }, [answers, selectedAnswerId]);

  const emoji =
    selectedValue != null
      ? emojiForNumberScaleValue(selectedValue)
      : NUMBER_SCALE_DEFAULT_EMOJI;

  const leftLabel = question.leftLabel?.trim() || "Not likely";
  const rightLabel = question.rightLabel?.trim() || "Very likely";

  return (
    <s-grid gridTemplateColumns="1fr" gap="base">
      <s-text color="subdued">{leftLabel}</s-text>

      <s-grid gridTemplateColumns="1fr" justifyItems="center" padding="small">
        <s-box
          border="base"
          borderRadius="max"
          padding="large"
          background="transparent"
        >
          <s-heading>{emoji}</s-heading>
        </s-box>
      </s-grid>

      <s-grid gridTemplateColumns="repeat(10, 1fr)" gap="none">
        {answers.map((answer) => {
          const selected = selectedAnswerId === answer.id;
          return (
            <s-button
              key={answer.id}
              type="button"
              variant={selected ? "primary" : "secondary"}
              onClick={() => onSelect(answer.id)}
            >
              {answer.content}
            </s-button>
          );
        })}
      </s-grid>

      <s-grid gridTemplateColumns="1fr" justifyItems="end">
        <s-text color="subdued">{rightLabel}</s-text>
      </s-grid>
    </s-grid>
  );
}
