import type { MetaFunction } from "react-router";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import { BlockStack, Box, Card, Layout, Page, Text } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import {
  PRIVACY_POLICY_DISCLAIMER,
  PRIVACY_POLICY_META,
  PRIVACY_POLICY_SECTIONS,
} from "../lib/legal/privacy-policy-sections";

export const meta: MetaFunction = () => [
  { title: `Privacy Policy — ${PRIVACY_POLICY_META.appName}` },
];

/**
 * Public privacy policy (no Shopify auth). Use this URL in the App Store listing.
 */
export default function PrivacyPolicyPage() {
  return (
    <PolarisAppProvider i18n={en}>
      <Page
        title="Privacy Policy"
        subtitle={`${PRIVACY_POLICY_META.appName} · Effective ${PRIVACY_POLICY_META.effectiveDate}`}
      >
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="p" tone="subdued">
                    {PRIVACY_POLICY_DISCLAIMER}
                  </Text>
                  <Text as="p">
                    <Text as="span" fontWeight="semibold">
                      App provider:
                    </Text>{" "}
                    {PRIVACY_POLICY_META.legalEntity}
                  </Text>
                </BlockStack>
              </Card>
              {PRIVACY_POLICY_SECTIONS.map((section) => (
                <Card key={section.id}>
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingMd">
                      {section.title}
                    </Text>
                    {section.paragraphs?.map((paragraph) => (
                      <Text as="p" key={paragraph.slice(0, 40)}>
                        {paragraph}
                      </Text>
                    ))}
                    {section.bullets?.map((item) => (
                      <Box key={item.slice(0, 40)} paddingInlineStart="400">
                        <Text as="p">• {item}</Text>
                      </Box>
                    ))}
                  </BlockStack>
                </Card>
              ))}
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisAppProvider>
  );
}
