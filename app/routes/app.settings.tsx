import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { BlockStack, Card, Layout, Link, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/**
 * Settings route loader. Auth only until merchant preferences are designed.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

/** Shop preferences, placement guidance, and privacy summary for App Store review. */
export default function SettingsPage() {
  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Thank you & Order status
                </Text>
                <Text as="p" tone="subdued">
                  Add the Post Purchase Survey block in the checkout editor on
                  the Thank you page and Order status page. Only surveys marked
                  live in Surveys are published to checkout.
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Data & privacy
                </Text>
                <Text as="p" tone="subdued">
                  We store survey answers with order context (order id/name,
                  optional email and customer fields when permitted), product
                  and channel metadata, and completion metrics. Uninstall and
                  Shopify shop/redact remove shop data from our database.
                  Customer redact and data request webhooks are supported.
                </Text>
                <Text as="p" tone="subdued">
                  Full policy for App Store and buyers:{" "}
                  <Link url="/privacy" target="_blank">
                    Privacy policy
                  </Link>
                  . Replace placeholders in the policy with your legal entity
                  and support email before production.
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
