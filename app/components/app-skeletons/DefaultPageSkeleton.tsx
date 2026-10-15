import { BlockStack, Layout, Page } from "@shopify/polaris";
import { CardTextSkeleton, PageHeaderSkeleton } from "./shared";

export function DefaultPageSkeleton() {
  return (
    <Page>
      <PageHeaderSkeleton />
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <CardTextSkeleton lines={4} />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
