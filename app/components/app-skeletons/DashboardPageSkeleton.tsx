import { BlockStack, Box, Card, InlineGrid, Layout, Page, SkeletonBodyText } from "@shopify/polaris";
import { CardTextSkeleton, StatTilesSkeleton } from "./shared";

export function DashboardPageSkeleton() {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <SkeletonBodyText lines={2} />
            </Card>
            <Card>
              <BlockStack gap="400">
                <Box minWidth="140px">
                  <SkeletonBodyText lines={1} />
                </Box>
                <StatTilesSkeleton count={2} />
              </BlockStack>
            </Card>
            <BlockStack gap="300">
              <Box minWidth="80px">
                <SkeletonBodyText lines={1} />
              </Box>
              <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="300">
                <CardTextSkeleton lines={2} />
                <CardTextSkeleton lines={2} />
                <CardTextSkeleton lines={2} />
              </InlineGrid>
            </BlockStack>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
