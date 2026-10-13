import { Checkbox } from "@shopify/polaris";

export interface QuestionSkippableCheckboxProps {
  checked: boolean;
  onChange: (skippable: boolean) => void;
  /** Consent email keeps skip enabled but does not allow turning it off. */
  disabled?: boolean;
}

export function QuestionSkippableCheckbox({
  checked,
  onChange,
  disabled = false,
}: QuestionSkippableCheckboxProps) {
  return (
    <Checkbox
      label="Allow customers to skip this question"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
