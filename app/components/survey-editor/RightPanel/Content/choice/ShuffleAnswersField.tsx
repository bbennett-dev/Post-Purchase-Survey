import { BlockStack, Checkbox, Text } from "@shopify/polaris";

export interface ShuffleAnswersFieldProps {
  checked: boolean;
  onChange: (shuffleAnswer: boolean) => void;
}

export function ShuffleAnswersField({ checked, onChange }: ShuffleAnswersFieldProps) {
  return (
    <BlockStack gap="100">
      <Checkbox
        label="Shuffle answers"
        checked={checked}
        onChange={onChange}
      />
      <Text as="p" tone="subdued">
        Randomize answer order for each user
      </Text>
    </BlockStack>
  );
}
