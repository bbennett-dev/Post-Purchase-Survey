import { BlockStack, Text, TextField } from "@shopify/polaris";

export interface ConsentEmailAnswersSectionProps {
  agreeLabel: string;
  onAgreeLabelChange: (value: string) => void;
}

/** “Answers” block — agree checkbox label shown to the customer. */
export function ConsentEmailAnswersSection({
  agreeLabel,
  onAgreeLabelChange,
}: ConsentEmailAnswersSectionProps) {
  return (
    <BlockStack gap="300">
      <Text as="p" fontWeight="semibold">
        Answers
      </Text>
      <Text as="p" tone="subdued">
        If customer tick &quot;agree&quot;, they have agreed to receive emails
        from your stores following the Privacy Policy of Shopify (only applies
        to logged-in customers)
      </Text>
      <TextField
        label="Agree"
        value={agreeLabel}
        onChange={onAgreeLabelChange}
        autoComplete="off"
      />
    </BlockStack>
  );
}
