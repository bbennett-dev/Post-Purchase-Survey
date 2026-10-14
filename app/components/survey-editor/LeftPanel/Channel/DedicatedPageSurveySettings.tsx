import { useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Box,
  Button,
  Checkbox,
  InlineStack,
  Text,
  TextField,
} from "@shopify/polaris";
import { ClipboardIcon } from "@shopify/polaris-icons";
import type { DedicatedPageSurveyChannel } from "../../../../lib/survey/types";

export interface DedicatedPageSurveySettingsProps {
  channel: DedicatedPageSurveyChannel;
  onChange: (patch: Partial<DedicatedPageSurveyChannel>) => void;
}

/**
 * Branded survey page settings in the left channel accordion (link + submissions).
 */
export function DedicatedPageSurveySettings({
  channel,
  onChange,
}: DedicatedPageSurveySettingsProps) {
  const shopify = useAppBridge();
  const link = channel.link?.trim() ?? "";

  const handleCopy = useCallback(async () => {
    if (!link) {
      shopify.toast.show("Save your survey to generate a link", { isError: true });
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      shopify.toast.show("Link copied");
    } catch {
      shopify.toast.show("Could not copy link", { isError: true });
    }
  }, [link, shopify]);

  return (
    <BlockStack gap="400">
      <BlockStack gap="200">
        <Text as="p" variant="bodySm" tone="subdued">
          Link
        </Text>
        <InlineStack gap="200" blockAlign="stretch" wrap={false}>
          <Box minWidth="0" width="100%">
            <TextField
              label="Survey link"
              labelHidden
              value={link}
              readOnly
              autoComplete="off"
            />
          </Box>
          <Button
            icon={ClipboardIcon}
            accessibilityLabel="Copy survey link"
            onClick={handleCopy}
          />
        </InlineStack>
        <Text as="p" variant="bodySm" tone="subdued">
          Survey link will be generated after you save your edit
        </Text>
      </BlockStack>

      <BlockStack gap="200">
        <Checkbox
          label="Allow multiple submissions"
          checked={channel.allowMultiSubmit === true}
          onChange={(allowMultiSubmit) => onChange({ allowMultiSubmit })}
        />
        <Text as="p" variant="bodySm" tone="subdued">
          Customers are able to submit a new response every time they open the
          link.
        </Text>
      </BlockStack>
    </BlockStack>
  );
}
