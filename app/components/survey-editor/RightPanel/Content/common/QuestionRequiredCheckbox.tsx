import { Checkbox } from "@shopify/polaris";

export interface QuestionRequiredCheckboxProps {
  /** When true, the customer must answer before continuing (`skippable` is false). */
  required: boolean;
  onChange: (required: boolean) => void;
}

/** Single / multiple choice: merchant-facing “required” toggle (inverse of `skippable`). */
export function QuestionRequiredCheckbox({
  required,
  onChange,
}: QuestionRequiredCheckboxProps) {
  return (
    <Checkbox
      label="Make this required"
      checked={required}
      onChange={onChange}
    />
  );
}
