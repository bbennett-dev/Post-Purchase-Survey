import { Text } from "@shopify/polaris";

interface ChannelPlaceholderBodyProps {
  channelLabel: string;
}

/** Temporary copy until per-channel left-panel rules are implemented. */
export function ChannelPlaceholderBody({
  channelLabel,
}: ChannelPlaceholderBodyProps) {
  return (
    <Text as="p" variant="bodySm" tone="subdued">
      Core settings and rules for {channelLabel} will appear here. Use the
      panel on the right for advanced options.
    </Text>
  );
}
