import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/**
 * Integrations route loader. Auth only until connection flows are designed.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

const integrations = [
  {
    name: "Klaviyo",
    detail: "Send the selected channel onto a customer profile.",
  },
  {
    name: "Google Sheets",
    detail: "Append each response to a spreadsheet.",
  },
  {
    name: "Webhooks",
    detail: "POST a payload to your own endpoint when an answer is saved.",
  },
];

/** Placeholder integrations list. Connect flows are not wired yet. */
export default function IntegrationsPage() {
  const shopify = useAppBridge();

  return (
    <Page title="Integrations">
      <Layout>
        <Layout.Section>
          <BlockStack gap="300">
            {integrations.map((integration) => (
              <Card key={integration.name}>
                <InlineGrid columns="1fr auto" gap="400" alignItems="center">
                  <BlockStack gap="100">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h3" variant="headingMd">
                        {integration.name}
                      </Text>
                      <Badge tone="info">Not connected</Badge>
                    </InlineStack>
                    <Text as="p" tone="subdued">
                      {integration.detail}
                    </Text>
                  </BlockStack>
                  <Button
                    onClick={() =>
                      shopify.toast.show(`${integration.name} setup comes next`)
                    }
                  >
                    Connect
                  </Button>
                </InlineGrid>
              </Card>
            ))}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
