import { Select } from "@shopify/polaris";
import { QUESTION_TYPES } from "../../../../../lib/survey/questions";
import type { QuestionType } from "../../../../../lib/survey/types";

export interface QuestionTypeSelectProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}

/** Question type dropdown (all supported editor types). */
export function QuestionTypeSelect({ value, onChange }: QuestionTypeSelectProps) {
  return (
    <Select
      label="Question type"
      options={QUESTION_TYPES.map((item) => ({
        label: item.label,
        value: item.type,
      }))}
      value={value}
      onChange={(next) => {
        if (QUESTION_TYPES.some((item) => item.type === next)) {
          onChange(next as QuestionType);
        }
      }}
    />
  );
}
