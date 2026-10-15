import { BlockStack, Layout, Page } from "@shopify/polaris";
import { PageHeaderSkeleton, TableListSkeleton } from "./shared";

export function SurveysIndexPageSkeleton() {
  return (
    <Page>
      <PageHeaderSkeleton withPrimaryAction withSecondaryAction />
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <TableListSkeleton rows={4} />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
