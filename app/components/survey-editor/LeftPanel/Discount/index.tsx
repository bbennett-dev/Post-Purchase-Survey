import type { SurveyDocument } from "../../../../lib/survey/types";

interface DiscountPanelProps {
  survey: SurveyDocument;
}

/**
 * Discount tab summary. Full discount editing is a follow-up feature.
 */
export function DiscountPanel({ survey }: DiscountPanelProps) {
  return (
    <s-stack gap="small-200">
      <s-paragraph color="subdued">
        The discount is stored on the survey. Editing it comes next.
      </s-paragraph>
      <s-badge tone={survey.discount.enabled ? "success" : "warning"}>
        {survey.discount.enabled ? "Discount on" : "Discount off"}
      </s-badge>
      {survey.discount.displayText ? (
        <s-text>{survey.discount.displayText}</s-text>
      ) : null}
    </s-stack>
  );
}
