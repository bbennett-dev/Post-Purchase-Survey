import { BlockStack, TextField } from "@shopify/polaris";

export interface ScaleLabelsFieldsProps {
  leftLabel: string;
  rightLabel: string;
  onChange: (patch: { leftLabel?: string; rightLabel?: string }) => void;
}

/** Left / right endpoint labels for scale-style questions. */
export function ScaleLabelsFields({
  leftLabel,
  rightLabel,
  onChange,
}: ScaleLabelsFieldsProps) {
  return (
    <BlockStack gap="400">
      <TextField
        label="Left label"
        value={leftLabel}
        onChange={(value) => onChange({ leftLabel: value })}
        autoComplete="off"
      />
      <TextField
        label="Right label"
        value={rightLabel}
        onChange={(value) => onChange({ rightLabel: value })}
        autoComplete="off"
      />
    </BlockStack>
  );
}
