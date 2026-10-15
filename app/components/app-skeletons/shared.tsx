import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonThumbnail,
} from "@shopify/polaris";

/** Page title row matching Polaris `Page` primary layout. */
export function PageHeaderSkeleton({
  withPrimaryAction = false,
  withSecondaryAction = false,
}: {
  withPrimaryAction?: boolean;
  withSecondaryAction?: boolean;
}) {
  return (
    <Box paddingBlockEnd="400">
      <InlineStack align="space-between" blockAlign="center" gap="400">
        <Box minWidth="120px" maxWidth="240px">
          <SkeletonDisplayText size="large" />
        </Box>
        <InlineStack gap="200">
          {withSecondaryAction ? (
            <Box minWidth="100px">
              <SkeletonDisplayText size="small" />
            </Box>
          ) : null}
          {withPrimaryAction ? (
            <Box minWidth="120px">
              <SkeletonDisplayText size="small" />
            </Box>
          ) : null}
        </InlineStack>
      </InlineStack>
    </Box>
  );
}

export function CardTextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card>
      <BlockStack gap="300">
        <SkeletonDisplayText size="small" />
        <SkeletonBodyText lines={lines} />
      </BlockStack>
    </Card>
  );
}

/** IndexTable / DataTable style rows inside a flush card. */
export function TableListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card padding="0">
      <Box padding="300" borderBlockEndWidth="025" borderColor="border">
        <Box minWidth="280px" maxWidth="360px">
          <SkeletonDisplayText size="small" />
        </Box>
      </Box>
      <BlockStack gap="0">
        {Array.from({ length: rows }, (_, index) => (
          <Box
            key={index}
            padding="300"
            borderBlockEndWidth={index < rows - 1 ? "025" : undefined}
            borderColor="border"
          >
            <InlineGrid columns={{ xs: "1fr auto" }} gap="300">
              <BlockStack gap="100">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={1} />
              </BlockStack>
              <SkeletonThumbnail size="small" />
            </InlineGrid>
          </Box>
        ))}
      </BlockStack>
    </Card>
  );
}

export function StatTilesSkeleton({ count = 2 }: { count?: number }) {
  return (
    <InlineGrid columns={{ xs: 1, sm: count }} gap="400">
      {Array.from({ length: count }, (_, index) => (
        <BlockStack key={index} gap="100">
          <SkeletonBodyText lines={1} />
          <SkeletonDisplayText size="large" />
        </BlockStack>
      ))}
    </InlineGrid>
  );
}
