import { Badge, BlockStack, InlineStack, Text } from "@shopify/polaris";
import { CHANNEL_DEFINITIONS } from "../../../../lib/survey/channels";
import type {
  PostPurchasePageChannel,
  SurveyChannel,
  SurveyDocument,
} from "../../../../lib/survey/types";
import { ChannelRow } from "./ChannelRow";
import { PostPurchaseSettings } from "./PostPurchaseSettings";

export interface ChannelPanelProps {
  survey: SurveyDocument;
  selectedChannelKey: string | null;
  onSelectChannel: (channelKey: string) => void;
  onChannelChange: (channelKey: string, patch: SurveyChannel) => void;
}

/**
 * Channel tab: accordion list with core settings inline; advanced settings on the right.
 */
export function ChannelPanel({
  survey,
  selectedChannelKey,
  onSelectChannel,
  onChannelChange,
}: ChannelPanelProps) {
  return (
    <BlockStack gap="300">
      <InlineStack gap="200" blockAlign="center">
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="semibold">
          Distribution channels
        </Text>
        <Badge>{String(CHANNEL_DEFINITIONS.length)}</Badge>
      </InlineStack>

      <BlockStack gap="200">
        {CHANNEL_DEFINITIONS.map((definition) => {
          const channel = survey.channels[definition.key] ?? {};
          const enabled = channel.enabled === true;
          const expanded = selectedChannelKey === definition.key;

          return (
            <ChannelRow
              key={definition.key}
              definition={definition}
              enabled={enabled}
              expanded={expanded}
              onToggleExpand={() => {
                onSelectChannel(expanded ? "" : definition.key);
              }}
              onEnabledChange={(nextEnabled) =>
                onChannelChange(definition.key, { enabled: nextEnabled })
              }
            >
              {definition.key === "postPurchasePage" ? (
                <PostPurchaseSettings
                  channel={channel as PostPurchasePageChannel}
                  onChange={(patch) =>
                    onChannelChange(definition.key, patch)
                  }
                />
              ) : (
                <Text as="p" tone="subdued">
                  Core settings for this channel come next.
                </Text>
              )}
            </ChannelRow>
          );
        })}
      </BlockStack>
    </BlockStack>
  );
}
