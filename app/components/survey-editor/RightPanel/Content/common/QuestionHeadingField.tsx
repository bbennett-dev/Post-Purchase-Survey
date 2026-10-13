import { TextField } from "@shopify/polaris";

export interface QuestionHeadingFieldProps {
  value: string;
  onChange: (heading: string) => void;
}

export function QuestionHeadingField({ value, onChange }: QuestionHeadingFieldProps) {
  return (
    <TextField
      label="Heading"
      value={value}
      onChange={onChange}
      autoComplete="off"
    />
  );
}
