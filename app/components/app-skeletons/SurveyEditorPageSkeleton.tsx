import {
  BlockStack,
  Box,
  InlineGrid,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";

/**
 * Matches survey editor chrome: toolbar + left list / center preview / right inspector.
 */
export function SurveyEditorPageSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--p-space-200)",
        minHeight: "100vh",
        padding: "var(--p-space-200)",
        background: "var(--p-color-bg)",
      }}
    >
      <Box
        padding="300"
        background="bg-surface-secondary"
        borderRadius="200"
        borderWidth="025"
        borderColor="border"
      >
        <InlineStack align="space-between" blockAlign="center" gap="300">
          <InlineStack gap="200">
            <Box minWidth="72px">
              <SkeletonDisplayText size="small" />
            </Box>
            <Box minWidth="72px">
              <SkeletonDisplayText size="small" />
            </Box>
            <Box minWidth="72px">
              <SkeletonDisplayText size="small" />
            </Box>
          </InlineStack>
          <Box minWidth="160px">
            <SkeletonDisplayText size="small" />
          </Box>
        </InlineStack>
      </Box>

      <div style={{ flex: "1 1 auto", minHeight: 0 }}>
        <InlineGrid
          columns={{ xs: "1fr", lg: "minmax(220px, 280px) minmax(0, 1fr) minmax(260px, 320px)" }}
          gap="200"
        >
          <EditorPanelSkeleton rows={6} />
          <EditorPanelSkeleton rows={1} tall />
          <EditorPanelSkeleton rows={5} />
        </InlineGrid>
      </div>
    </div>
  );
}

function EditorPanelSkeleton({
  rows,
  tall = false,
}: {
  rows: number;
  tall?: boolean;
}) {
  return (
    <Box
      padding="300"
      background="bg-surface"
      borderRadius="200"
      borderWidth="025"
      borderColor="border"
      minHeight={tall ? "420px" : "320px"}
    >
      <BlockStack gap="300">
        <SkeletonDisplayText size="small" />
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonBodyText key={index} lines={tall ? 4 : 1} />
        ))}
      </BlockStack>
    </Box>
  );
}
