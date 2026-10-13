import { BlockStack, Checkbox, Divider } from "@shopify/polaris";
import { ConsentEmailAnswersSection } from "../consent/ConsentEmailAnswersSection";
import { QuestionImageBlock } from "../common/QuestionImageBlock";
import { QuestionSkippableCheckbox } from "../common/QuestionSkippableCheckbox";
import { resolveQuestionImage } from "../common/questionImageDefaults";
import type { QuestionTypeInspectorProps } from "./QuestionTypeInspectorProps";

/**
 * Consent email — competitor layout: image → skip (fixed) → show-if-consented → Answers.
 */
export function ConsentEmailInspector({
  question,
  onQuestionChange,
}: QuestionTypeInspectorProps) {
  return (
    <BlockStack gap="500">
      <QuestionImageBlock
        image={resolveQuestionImage(question)}
        onChange={(image) => onQuestionChange({ image })}
        showSize
      />

      <QuestionSkippableCheckbox
        checked
        disabled
        onChange={() => onQuestionChange({ skippable: true })}
      />

      <Checkbox
        label="Show the question to the customer who has already given consent"
        checked={question.showCustomerAlready === true}
        onChange={(showCustomerAlready) =>
          onQuestionChange({ showCustomerAlready })
        }
      />

      <Divider />

      <ConsentEmailAnswersSection
        agreeLabel={question.agreeDescriptionEmail ?? "I agree"}
        onAgreeLabelChange={(agreeDescriptionEmail) =>
          onQuestionChange({ agreeDescriptionEmail })
        }
      />
    </BlockStack>
  );
}
