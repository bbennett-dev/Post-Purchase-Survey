import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/**
 * Settings route loader. Auth only until merchant preferences are designed.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

/** Placeholder settings page. Preference controls come in a later pass. */
export default function SettingsPage() {
  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Thank You page
                </Text>
                <Text as="p" tone="subdued">
                  Placement of the survey block on the order status page will be
                  configured here, along with the default question and whether
                  the survey is shown.
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Account
                </Text>
                <Text as="p" tone="subdued">
                  Shop-level preferences such as timezone and export defaults
                  will live in this section once we design them.
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
