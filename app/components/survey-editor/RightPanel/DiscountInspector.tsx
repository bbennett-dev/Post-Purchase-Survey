import { BlockStack, Text, TextField } from "@shopify/polaris";
import type {
  DiscountPreviewTarget,
  SurveyDiscount,
  SurveyDocument,
} from "../../../lib/survey/types";

export interface DiscountInspectorProps {
  survey: SurveyDocument;
  selectedDiscountTarget: DiscountPreviewTarget;
  onDiscountChange: (patch: Partial<SurveyDiscount>) => void;
}

/**
 * Discount tab (right): copy for the preview target selected on the left.
 */
export function DiscountInspector({
  survey,
  selectedDiscountTarget,
  onDiscountChange,
}: DiscountInspectorProps) {
  const { discount } = survey;

  if (!discount.enabled) {
    return (
      <Text as="p" tone="subdued">
        Turn on discount in the left panel to edit banner and thank-you card
        content.
      </Text>
    );
  }

  if (selectedDiscountTarget === "banner") {
    const banner = discount.banner ?? {};
    return (
      <BlockStack gap="400">
        <TextField
          label="Heading"
          value={banner.heading ?? ""}
          onChange={(heading) =>
            onDiscountChange({ banner: { ...banner, heading } })
          }
          autoComplete="off"
        />
        <TextField
          label="Description"
          value={banner.description ?? ""}
          onChange={(description) =>
            onDiscountChange({ banner: { ...banner, description } })
          }
          autoComplete="off"
          multiline={3}
        />
      </BlockStack>
    );
  }

  const card = discount.card ?? {};
  return (
    <BlockStack gap="400">
      <TextField
        label="Heading"
        value={card.heading ?? ""}
        onChange={(heading) =>
          onDiscountChange({ card: { ...card, heading } })
        }
        autoComplete="off"
      />
      <TextField
        label="Description"
        value={card.description ?? ""}
        onChange={(description) =>
          onDiscountChange({ card: { ...card, description } })
        }
        autoComplete="off"
        multiline={3}
      />
      <TextField
        label="Email placeholder"
        value={card.placeholder ?? ""}
        onChange={(placeholder) =>
          onDiscountChange({ card: { ...card, placeholder } })
        }
        autoComplete="off"
      />
      <TextField
        label="Button text"
        value={card.buttonText ?? ""}
        onChange={(buttonText) =>
          onDiscountChange({ card: { ...card, buttonText } })
        }
        autoComplete="off"
      />
    </BlockStack>
  );
}
