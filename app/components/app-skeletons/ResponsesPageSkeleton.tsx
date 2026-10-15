import { BlockStack, Layout, Page } from "@shopify/polaris";
import { PageHeaderSkeleton, TableListSkeleton } from "./shared";

export function ResponsesPageSkeleton() {
  return (
    <Page>
      <PageHeaderSkeleton withPrimaryAction />
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <TableListSkeleton rows={5} />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
