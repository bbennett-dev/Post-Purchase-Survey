import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { CardTextSkeleton, PageHeaderSkeleton, StatTilesSkeleton } from "./shared";

export function DashboardPageSkeleton() {
  return (
    <Page>
      <PageHeaderSkeleton withPrimaryAction withSecondaryAction />
      <BlockStack gap="500">
        <Card>
          <SkeletonBodyText lines={5} />
        </Card>
        <Card>
          <SkeletonBodyText lines={3} />
        </Card>
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              <StatTilesSkeleton count={4} />
              <Card>
                <BlockStack gap="400">
                  <Box minWidth="160px">
                    <SkeletonBodyText lines={1} />
                  </Box>
                  <SkeletonBodyText lines={4} />
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <CardTextSkeleton lines={4} />
              <InlineGrid columns={1} gap="300">
                <CardTextSkeleton lines={3} />
                <CardTextSkeleton lines={3} />
                <CardTextSkeleton lines={3} />
              </InlineGrid>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
