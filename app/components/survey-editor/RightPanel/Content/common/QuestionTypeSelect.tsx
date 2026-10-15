import { Select } from "@shopify/polaris";
import { questionTypesForEditorSelect } from "../../../../../lib/survey/questions";
import type { QuestionType } from "../../../../../lib/survey/types";

export interface QuestionTypeSelectProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}

/** Question type dropdown (all supported editor types). */
export function QuestionTypeSelect({ value, onChange }: QuestionTypeSelectProps) {
  const types = questionTypesForEditorSelect(value);

  return (
    <Select
      label="Question type"
      options={types.map((item) => ({
        label: item.label,
        value: item.type,
      }))}
      value={value}
      onChange={(next) => {
        if (types.some((item) => item.type === next)) {
          onChange(next as QuestionType);
        }
      }}
    />
  );
}
