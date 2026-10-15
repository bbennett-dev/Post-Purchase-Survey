import { BlockStack, Box, Card, Text } from "@shopify/polaris";
import { CHANNEL_LABELS } from "../../../../lib/survey/channels";
import { PreviewDemoFooter } from "../PreviewDemoFooter";
import { PreviewScrollShell } from "../PreviewScrollShell";
import type { EditorPreviewFrameProps } from "../types";

interface UnsupportedChannelPreviewProps extends EditorPreviewFrameProps {
  channelKey: string;
}

export function UnsupportedChannelPreview({
  channelKey,
  onRestartDemo,
  selection: _selection,
  onPreviewNavigate: _onPreviewNavigate,
}: UnsupportedChannelPreviewProps) {
  const label = CHANNEL_LABELS[channelKey] ?? channelKey;

  return (
    <PreviewScrollShell
      footer={
        <Box padding="400">
          <PreviewDemoFooter onRestartDemo={onRestartDemo} />
        </Box>
      }
    >
      <Box padding="600">
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Preview coming soon
            </Text>
            <Text as="p" tone="subdued">
              A live preview for &quot;{label}&quot; is not available in the
              editor yet. Thank you page preview is available when editing the
              Thank you page channel.
            </Text>
          </BlockStack>
        </Card>
      </Box>
    </PreviewScrollShell>
  );
}
