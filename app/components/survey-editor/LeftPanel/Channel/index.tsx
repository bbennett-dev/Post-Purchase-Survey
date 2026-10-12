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
    <s-stack gap="small">
      <s-stack direction="inline" gap="small-200" alignItems="center">
        <s-text type="strong" color="subdued">
          Distribution channels
        </s-text>
        <s-badge tone="neutral">{CHANNEL_DEFINITIONS.length}</s-badge>
      </s-stack>

      <s-stack gap="small-200">
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
                <s-paragraph color="subdued">
                  Core settings for this channel come next.
                </s-paragraph>
              )}
            </ChannelRow>
          );
        })}
      </s-stack>
    </s-stack>
  );
}
