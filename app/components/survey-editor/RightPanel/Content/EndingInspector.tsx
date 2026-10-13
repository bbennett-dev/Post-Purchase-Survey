import { BlockStack, TextField } from "@shopify/polaris";
import type { ThankYouContent } from "../../../../lib/survey/types";

export interface EndingInspectorProps {
  ending: ThankYouContent;
  onEndingChange: (patch: Partial<ThankYouContent>) => void;
}

export function EndingInspector({ ending, onEndingChange }: EndingInspectorProps) {
  return (
    <BlockStack gap="400">
      <TextField
        label="Heading"
        value={ending.heading}
        onChange={(heading) => onEndingChange({ heading })}
        autoComplete="off"
      />
      <TextField
        label="Description"
        value={ending.description}
        onChange={(description) => onEndingChange({ description })}
        multiline={3}
        autoComplete="off"
      />
      <TextField
        label="Button text"
        value={ending.buttonText}
        onChange={(buttonText) => onEndingChange({ buttonText })}
        autoComplete="off"
      />
    </BlockStack>
  );
}
