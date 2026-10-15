import { Box, Divider } from "@shopify/polaris";
import { channelDefinitionsForEditor } from "../../../../lib/survey/channels";
import type {
  DedicatedPageSurveyChannel,
  PostPurchasePageChannel,
  SurveyChannel,
  SurveyDocument,
} from "../../../../lib/survey/types";
import { ChannelPlaceholderBody } from "./ChannelPlaceholderBody";
import { ChannelRow } from "./ChannelRow";
import { DedicatedPageSurveySettings } from "./DedicatedPageSurveySettings";
import { PostPurchaseSettings } from "./PostPurchaseSettings";

export interface ChannelPanelProps {
  survey: SurveyDocument;
  selectedChannelKey: string | null;
  onSelectChannel: (channelKey: string) => void;
  onChannelChange: (channelKey: string, patch: SurveyChannel) => void;
}

/**
 * Channel tab — flat accordion list (competitor + theme editor app embeds):
 * one bordered group, rows separated by dividers, no per-channel card stacks.
 */
export function ChannelPanel({
  survey,
  selectedChannelKey,
  onSelectChannel,
  onChannelChange,
}: ChannelPanelProps) {
  const channelDefinitions = channelDefinitionsForEditor();
  const lastIndex = channelDefinitions.length - 1;

  return (
    <Box
      borderWidth="025"
      borderColor="border"
      borderRadius="200"
      overflowX="hidden"
      overflowY="hidden"
      background="bg-surface"
    >
      {channelDefinitions.map((definition, index) => {
        const channel = survey.channels[definition.key] ?? {};
        const enabled = channel.enabled === true;
        const expanded = selectedChannelKey === definition.key;

        return (
          <Box key={definition.key}>
            <ChannelRow
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
              ) : definition.key === "dedicatedPageSurvey" ? (
                <DedicatedPageSurveySettings
                  channel={channel as DedicatedPageSurveyChannel}
                  onChange={(patch) =>
                    onChannelChange(definition.key, patch)
                  }
                />
              ) : (
                <ChannelPlaceholderBody channelLabel={definition.label} />
              )}
            </ChannelRow>
            {index < lastIndex ? <Divider /> : null}
          </Box>
        );
      })}
    </Box>
  );
}
