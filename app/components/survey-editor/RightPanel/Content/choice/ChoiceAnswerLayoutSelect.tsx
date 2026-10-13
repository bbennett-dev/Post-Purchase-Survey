import { Box, InlineGrid, Select, Text } from "@shopify/polaris";
import type { ChoiceAnswerLayout } from "../../../../../lib/survey/types";

const ANSWER_LAYOUT_OPTIONS: { label: string; value: ChoiceAnswerLayout }[] = [
  { value: "text_only", label: "Text only" },
  { value: "text_with_image", label: "Text with image" },
];

export interface ChoiceAnswerLayoutSelectProps {
  value: ChoiceAnswerLayout;
  onChange: (layout: ChoiceAnswerLayout) => void;
}

export function ChoiceAnswerLayoutSelect({
  value,
  onChange,
}: ChoiceAnswerLayoutSelectProps) {
  return (
    <InlineGrid columns="1fr minmax(140px, 11.75rem)" gap="200" alignItems="end">
      <Text as="span" fontWeight="semibold">
        Answer layout
      </Text>
      <Box minWidth="0">
        <Select
          label="Answer layout"
          labelHidden
          options={ANSWER_LAYOUT_OPTIONS}
          value={value}
          onChange={(next) => {
            if (next === "text_only" || next === "text_with_image") {
              onChange(next);
            }
          }}
        />
      </Box>
    </InlineGrid>
  );
}
