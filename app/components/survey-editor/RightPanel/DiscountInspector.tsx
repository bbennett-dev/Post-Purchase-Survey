import { BlockStack, Checkbox, Text, TextField } from "@shopify/polaris";
import type { SurveyDiscount, SurveyDocument } from "../../../lib/survey/types";

export interface DiscountInspectorProps {
  survey: SurveyDocument;
  onDiscountChange: (patch: Partial<SurveyDiscount>) => void;
}

/**
 * Discount tab: reward settings for the survey (starter fields).
 */
export function DiscountInspector({
  survey,
  onDiscountChange,
}: DiscountInspectorProps) {
  const { discount } = survey;

  return (
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">
        Discount reward
      </Text>
      <Text as="p" tone="subdued">
        Offer a code after customers complete the survey. Full reward rules
        come in a later pass.
      </Text>

      <Checkbox
        label="Enable discount reward"
        checked={discount.enabled}
        onChange={(checked) => onDiscountChange({ enabled: checked })}
      />

      <TextField
        label="Display text"
        value={discount.displayText ?? ""}
        onChange={(displayText) => onDiscountChange({ displayText })}
        autoComplete="off"
      />

      <TextField
        label="Discount code"
        value={discount.code ?? ""}
        onChange={(code) => onDiscountChange({ code })}
        autoComplete="off"
      />
    </BlockStack>
  );
}
