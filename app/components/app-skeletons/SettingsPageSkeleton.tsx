import {
  BlockStack,
  Layout,
  Page,
  SkeletonBodyText,
  Card,
  InlineGrid,
} from "@shopify/polaris";
import { CardTextSkeleton } from "./shared";

export function SettingsPageSkeleton() {
  return (
    <Page title="Settings">
      <BlockStack gap="500">
        <Card>
          <SkeletonBodyText lines={3} />
        </Card>
        <Card>
          <SkeletonBodyText lines={5} />
        </Card>
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <CardTextSkeleton lines={8} />
              <Card>
                <SkeletonBodyText lines={2} />
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <CardTextSkeleton lines={3} />
              <InlineGrid columns={1} gap="300">
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
