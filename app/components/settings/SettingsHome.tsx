import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  Link,
  List,
  Page,
  Text,
} from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";
import { DashboardExtensionStatusCard } from "../dashboard/DashboardExtensionStatusCard";
import { useExtensionPlacementStatus } from "../../hooks/useExtensionPlacementStatus";
import type { CheckoutEditorLinks } from "../../lib/shopify/checkout-editor-url.server";
import { responsesHref } from "../../lib/routes/responses-route";

const THANK_YOU_DOCS =
  "https://shopify.dev/docs/apps/build/checkout/thank-you-order-status";

const RESOURCE_LINKS: {
  title: string;
  description: string;
  url: string;
  external: boolean;
}[] = [
  {
    title: "Thank you & Order status extensions",
    description: "Official guide for checkout UI placement.",
    url: THANK_YOU_DOCS,
    external: true,
  },
  {
    title: "Privacy policy",
    description: "What we collect, retention, and GDPR webhooks.",
    url: "/privacy",
    external: false,
  },
];

/**
 * Merchant settings — checkout placement, embed status, privacy, and resources.
 */
export function SettingsHome({
  checkoutEditor,
}: {
  checkoutEditor: CheckoutEditorLinks;
}) {
  const placementState = useExtensionPlacementStatus();

  return (
    <Page
      title="Settings"
      subtitle="Configure checkout placement, review data practices, and find help."
    >
      <BlockStack gap="500">
        <DashboardExtensionStatusCard
          checkoutEditor={checkoutEditor}
          placementState={placementState}
        />

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Checkout placement
            </Text>
            <Text as="p" tone="subdued">
              Surveys marked <Text as="span" fontWeight="semibold">live</Text>{" "}
              in Surveys are published to checkout. Add the app block on Thank
              you and optionally Order status so buyers can respond after
              purchase.
            </Text>
            <List type="number">
              <List.Item>
                Open the checkout editor for your published profile.
              </List.Item>
              <List.Item>
                Under Apps, add{" "}
                <Text as="span" fontWeight="semibold">
                  Post Purchase Survey
                </Text>{" "}
                (block or announcement bar on Thank you).
              </List.Item>
              <List.Item>Save the profile, then place a test order.</List.Item>
            </List>
            <InlineStack gap="300" wrap>
              <Button
                icon={ExternalIcon}
                url={checkoutEditor.thankYou}
                external
                target="_blank"
              >
                Thank you editor
              </Button>
              <Button
                icon={ExternalIcon}
                url={checkoutEditor.orderStatus}
                external
                target="_blank"
              >
                Order status editor
              </Button>
              <Button variant="plain" url={THANK_YOU_DOCS} external target="_blank">
                View Shopify docs
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Data &amp; privacy
                  </Text>
                  <Text as="p" tone="subdued">
                    Post-purchase survey responses are stored in this
                    app&apos;s database with shop scoping. Typical fields
                    include:
                  </Text>
                  <List>
                    <List.Item>
                      Survey answers and question metadata tied to an order
                      (order id / name when available)
                    </List.Item>
                    <List.Item>
                      Optional customer fields when your survey and Shopify
                      permissions allow
                    </List.Item>
                    <List.Item>
                      Product and channel context from the checkout extension
                    </List.Item>
                    <List.Item>
                      Completion timestamps for display recurrence rules
                    </List.Item>
                  </List>
                  <Banner tone="info">
                    <Text as="p">
                      Uninstall and Shopify{" "}
                      <Text as="span" fontWeight="semibold">
                        shop/redact
                      </Text>{" "}
                      webhooks remove shop data from our database. Customer
                      redact and data request webhooks are supported for App
                      Store compliance.
                    </Text>
                  </Banner>
                  <Text as="p" tone="subdued">
                    Full policy for App Store and buyers:{" "}
                    <Link url="/privacy" target="_blank">
                      Privacy policy
                    </Link>
                    .
                  </Text>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    App navigation
                  </Text>
                  <InlineGrid columns={{ xs: 1, sm: 3 }} gap="300">
                    <Button url="/app">Dashboard</Button>
                    <Button url="/app/surveys">Surveys</Button>
                    <Button url={responsesHref({ view: "active" })}>
                      Responses
                    </Button>
                  </InlineGrid>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Store
                  </Text>
                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="100">
                      <Text as="p" tone="subdued" variant="bodySm">
                        Checkout profile
                      </Text>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {checkoutEditor.profileId
                          ? `#${checkoutEditor.profileId}`
                          : "Published profile (open editor to confirm)"}
                      </Text>
                    </BlockStack>
                  </Box>
                  <Text as="p" tone="subdued" variant="bodySm">
                    Editor links use your store&apos;s published checkout
                    profile ({checkoutEditor.shopHandle}.myshopify.com).
                  </Text>
                </BlockStack>
              </Card>

              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Resources
                </Text>
                {RESOURCE_LINKS.map((item) => (
                  <Card key={item.url}>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        {item.title}
                      </Text>
                      <Text as="p" tone="subdued" variant="bodySm">
                        {item.description}
                      </Text>
                      <Box paddingBlockStart="100">
                        <Button
                          url={item.url}
                          external={item.external}
                          target={item.external ? "_blank" : undefined}
                          icon={item.external ? ExternalIcon : undefined}
                        >
                          Open
                        </Button>
                      </Box>
                    </BlockStack>
                  </Card>
                ))}
              </BlockStack>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
