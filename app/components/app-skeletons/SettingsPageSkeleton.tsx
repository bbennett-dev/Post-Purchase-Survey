import { BlockStack, Layout, Page } from "@shopify/polaris";
import { CardTextSkeleton } from "./shared";

export function SettingsPageSkeleton() {
  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <CardTextSkeleton lines={4} />
            <CardTextSkeleton lines={5} />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
