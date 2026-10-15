import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  Layout,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { PageHeaderSkeleton } from "./shared";

export function SurveysTemplatesPageSkeleton() {
  return (
    <Page>
      <PageHeaderSkeleton withPrimaryAction={false} />
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <InlineGrid columns={{ xs: 2, sm: 4 }} gap="200">
              {Array.from({ length: 4 }, (_, index) => (
                <Box key={index} minHeight="36px">
                  <SkeletonDisplayText size="small" />
                </Box>
              ))}
            </InlineGrid>
            <InlineGrid columns={{ xs: 1, sm: 2, lg: 3 }} gap="400">
              {Array.from({ length: 6 }, (_, index) => (
                <Card key={index}>
                  <BlockStack gap="300">
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={3} />
                    <Box minWidth="100px">
                      <SkeletonDisplayText size="small" />
                    </Box>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
