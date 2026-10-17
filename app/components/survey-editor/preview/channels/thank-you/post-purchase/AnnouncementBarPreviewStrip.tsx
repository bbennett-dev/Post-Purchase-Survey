import { Box, InlineStack, Text } from "@shopify/polaris";
import type { ResolvedPostPurchaseAnnouncementCopy } from "../../../../../../lib/survey/post-purchase-display";

export interface AnnouncementBarPreviewStripProps {
  copy: ResolvedPostPurchaseAnnouncementCopy;
  onOpenSurvey: () => void;
}

/**
 * Editor mock of checkout announcement bar (post-purchase channel only).
 */
export function AnnouncementBarPreviewStrip({
  copy,
  onOpenSurvey,
}: AnnouncementBarPreviewStripProps) {
  return (
    <Box
      padding="300"
      paddingInline="400"
      background="bg-fill-info"
      color="text-info-on-bg-fill"
    >
      <InlineStack align="space-between" blockAlign="center" gap="300">
        <InlineStack gap="200" blockAlign="center">
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {copy.content}
          </Text>
          <button
            type="button"
            onClick={onOpenSurvey}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "inherit",
              textDecoration: "underline",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            {copy.buttonText}
          </button>
        </InlineStack>
        <Text as="span" variant="bodyMd" tone="subdued">
          ×
        </Text>
      </InlineStack>
    </Box>
  );
}
