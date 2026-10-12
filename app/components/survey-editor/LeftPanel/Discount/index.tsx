import type { SurveyDocument } from "../../../../lib/survey/types";

interface DiscountPanelProps {
  survey: SurveyDocument;
}

/**
 * Discount tab list summary. Full editing is in the right panel.
 */
export function DiscountPanel({ survey }: DiscountPanelProps) {
  return (
    <s-stack gap="small-200">
      <s-text type="strong" color="subdued">
        Reward
      </s-text>
      <s-badge tone={survey.discount.enabled ? "success" : "warning"}>
        {survey.discount.enabled ? "Discount on" : "Discount off"}
      </s-badge>
      {survey.discount.displayText ? (
        <s-text>{survey.discount.displayText}</s-text>
      ) : (
        <s-paragraph color="subdued">
          Configure the discount on the right.
        </s-paragraph>
      )}
    </s-stack>
  );
}
