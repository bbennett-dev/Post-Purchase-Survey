import { Badge, BlockStack, Text } from "@shopify/polaris";
import type { SurveyDocument } from "../../../../lib/survey/types";

interface DiscountPanelProps {
  survey: SurveyDocument;
}

/**
 * Discount tab list summary. Full editing is in the right panel.
 */
export function DiscountPanel({ survey }: DiscountPanelProps) {
  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodySm" tone="subdued" fontWeight="semibold">
        Reward
      </Text>
      <Badge tone={survey.discount.enabled ? "success" : "warning"}>
        {survey.discount.enabled ? "Discount on" : "Discount off"}
      </Badge>
      {survey.discount.displayText ? (
        <Text as="p">{survey.discount.displayText}</Text>
      ) : (
        <Text as="p" tone="subdued">
          Configure the discount on the right.
        </Text>
      )}
    </BlockStack>
  );
}
