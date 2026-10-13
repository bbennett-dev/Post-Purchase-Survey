import { TextField } from "@shopify/polaris";

export interface QuestionDescriptionFieldProps {
  value: string;
  onChange: (description: string) => void;
}

export function QuestionDescriptionField({
  value,
  onChange,
}: QuestionDescriptionFieldProps) {
  return (
    <TextField
      label="Description"
      value={value}
      onChange={onChange}
      autoComplete="off"
    />
  );
}
