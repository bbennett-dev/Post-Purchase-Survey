import type { SurveyDiscount, SurveyDocument } from "../../../lib/survey/types";
import { fieldValue } from "../field-value";

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
    <s-stack gap="base">
      <s-heading>Discount reward</s-heading>
      <s-paragraph color="subdued">
        Offer a code after customers complete the survey. Full reward rules come
        in a later pass.
      </s-paragraph>

      <s-switch
        label="Enable discount reward"
        checked={discount.enabled}
        onChange={(event) =>
          onDiscountChange({
            enabled: Boolean(
              (event.currentTarget as HTMLElement & { checked?: boolean })
                .checked,
            ),
          })
        }
      />

      <s-text-field
        label="Display text"
        value={discount.displayText ?? ""}
        onInput={(event) =>
          onDiscountChange({ displayText: fieldValue(event) })
        }
      />

      <s-text-field
        label="Discount code"
        value={discount.code ?? ""}
        onInput={(event) => onDiscountChange({ code: fieldValue(event) })}
      />
    </s-stack>
  );
}
