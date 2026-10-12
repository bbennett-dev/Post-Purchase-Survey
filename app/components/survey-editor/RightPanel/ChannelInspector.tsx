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

/** Right-panel title overrides (shorter merchant-facing names). */
const RIGHT_PANEL_TITLES: Record<string, string> = {
  postPurchasePage: "Thank you page",
};

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
      <s-paragraph color="subdued">
        Expand a channel on the left to edit its advanced settings here.
      </s-paragraph>
    );
  }

  const definition = CHANNEL_DEFINITIONS.find(
    (item) => item.key === selectedChannelKey,
  );

  if (!definition) {
    return <s-paragraph color="subdued">Unknown channel.</s-paragraph>;
  }

  const channel = survey.channels[selectedChannelKey] ?? {};
  const title =
    RIGHT_PANEL_TITLES[selectedChannelKey] ?? definition.label;

  return (
    <s-stack gap="base">
      <s-text type="strong">{title}</s-text>

      {selectedChannelKey === "postPurchasePage" ? (
        <PostPurchaseAdvancedSettings
          channel={channel as PostPurchasePageChannel}
          checkoutEditor={checkoutEditor}
          onChange={(patch) => onChannelChange(selectedChannelKey, patch)}
        />
      ) : (
        <s-stack gap="small-200">
          <s-paragraph color="subdued">
            Advanced settings for this channel will appear here.
          </s-paragraph>
        </s-stack>
      )}
    </s-stack>
  );
}
