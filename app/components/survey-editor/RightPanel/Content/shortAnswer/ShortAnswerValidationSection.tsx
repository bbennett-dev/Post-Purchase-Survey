import {
  BlockStack,
  Box,
  Divider,
  InlineGrid,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import type { ShortAnswerFormat } from "../../../../../lib/survey/types";
import { ChannelSwitch } from "../../../LeftPanel/Channel/ChannelSwitch";

const FORMAT_OPTIONS: { label: string; value: ShortAnswerFormat }[] = [
  { label: "Any text", value: "any_text" },
  { label: "Numbers only", value: "numbers_only" },
];

export interface ShortAnswerValidationSectionProps {
  enabled: boolean;
  answerFormat: ShortAnswerFormat;
  minCharacters: string;
  maxCharacters: string;
  onEnabledChange: (enabled: boolean) => void;
  onFormatChange: (format: ShortAnswerFormat) => void;
  onMinCharactersChange: (value: string) => void;
  onMaxCharactersChange: (value: string) => void;
}

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/** Bordered “Answer validation” card with toggle, format, and character limits. */
export function ShortAnswerValidationSection({
  enabled,
  answerFormat,
  minCharacters,
  maxCharacters,
  onEnabledChange,
  onFormatChange,
  onMinCharactersChange,
  onMaxCharactersChange,
}: ShortAnswerValidationSectionProps) {
  return (
    <Box
      borderWidth="025"
      borderColor="border"
      borderRadius="200"
      overflowX="hidden"
      overflowY="hidden"
    >
      <Box padding="300">
        <InlineGrid columns="1fr auto" gap="200" alignItems="center">
          <Text as="p" fontWeight="semibold">
            Answer validation
          </Text>
          <ChannelSwitch
            enabled={enabled}
            accessibilityLabel="Enable answer validation"
            onChange={onEnabledChange}
          />
        </InlineGrid>
      </Box>

      {enabled ? (
        <>
          <Divider />
          <Box padding="300">
            <BlockStack gap="400">
              <Select
                label="Answer format"
                options={FORMAT_OPTIONS}
                value={answerFormat}
                onChange={(next) => {
                  if (next === "any_text" || next === "numbers_only") {
                    onFormatChange(next);
                  }
                }}
              />

              <InlineGrid columns="1fr 1fr" gap="300">
                <TextField
                  label="Minimum characters"
                  type="number"
                  min={0}
                  value={minCharacters}
                  onChange={onMinCharactersChange}
                  autoComplete="off"
                />
                <TextField
                  label="Maximum characters"
                  type="number"
                  min={0}
                  value={maxCharacters}
                  onChange={onMaxCharactersChange}
                  autoComplete="off"
                />
              </InlineGrid>
            </BlockStack>
          </Box>
        </>
      ) : null}
    </Box>
  );
}

export { parseOptionalInt };
