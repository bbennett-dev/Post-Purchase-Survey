import { BlockStack, Text, TextField } from "@shopify/polaris";

export interface ShortAnswerAnswersSectionProps {
  placeholder: string;
  onChange: (placeholder: string) => void;
}

/** “Answer(s)” block — description shown in the short-answer input. */
export function ShortAnswerAnswersSection({
  placeholder,
  onChange,
}: ShortAnswerAnswersSectionProps) {
  return (
    <BlockStack gap="300">
      <Text as="p" fontWeight="semibold">
        Answer(s)
      </Text>
      <TextField
        label="Description"
        value={placeholder}
        onChange={onChange}
        autoComplete="off"
      />
    </BlockStack>
  );
}
