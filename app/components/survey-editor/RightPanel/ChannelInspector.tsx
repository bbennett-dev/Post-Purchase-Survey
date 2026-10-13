import { BlockStack, Text } from "@shopify/polaris";
import type { CheckoutEditorLinks } from "../../../lib/shopify/checkout-editor-url.server";
import { CHANNEL_DEFINITIONS } from "../../../lib/survey/channels";
import type {
  PostPurchasePageChannel,
  SurveyChannel,
  SurveyDocument,
} from "../../../lib/survey/types";
import { PostPurchaseAdvancedSettings } from "./Channel/PostPurchaseAdvancedSettings";

export interface ChannelInspectorProps {
  survey: SurveyDocument;
  checkoutEditor: CheckoutEditorLinks;
  selectedChannelKey: string | null;
  onChannelChange: (channelKey: string, patch: SurveyChannel) => void;
}

/**
 * Channel tab: advanced configuration for the channel selected on the left.
 */
export function ChannelInspector({
  survey,
  checkoutEditor,
  selectedChannelKey,
  onChannelChange,
}: ChannelInspectorProps) {
  if (!selectedChannelKey) {
    return (
      <Text as="p" tone="subdued">
        Expand a channel on the left to edit its advanced settings here.
      </Text>
    );
  }

  const definition = CHANNEL_DEFINITIONS.find(
    (item) => item.key === selectedChannelKey,
  );

  if (!definition) {
    return (
      <Text as="p" tone="subdued">
        Unknown channel.
      </Text>
    );
  }

  const channel = survey.channels[selectedChannelKey] ?? {};

  return (
    <BlockStack gap="400">
      {selectedChannelKey === "postPurchasePage" ? (
        <PostPurchaseAdvancedSettings
          channel={channel as PostPurchasePageChannel}
          checkoutEditor={checkoutEditor}
          onChange={(patch) => onChannelChange(selectedChannelKey, patch)}
        />
      ) : (
        <Text as="p" tone="subdued">
          Advanced settings for this channel will appear here.
        </Text>
      )}
    </BlockStack>
  );
}
