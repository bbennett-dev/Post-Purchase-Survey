import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

interface DashboardLoaderData {
  activeSurveys: number;
  totalResponses: number;
  responseRate: string;
  topChannel: string;
}

/**
 * Authenticated dashboard loader.
 * Returns a short shop snapshot. Detailed screens live on their own routes.
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  await authenticate.admin(request);

  return {
    activeSurveys: 1,
    totalResponses: 248,
    responseRate: "34.2%",
    topChannel: "Instagram",
  };
};

const NAV_TILES = [
  {
    to: "/app/surveys",
    heading: "Surveys",
    body: "Create and manage the questions shown after checkout.",
  },
  {
    to: "/app/responses",
    heading: "Responses",
    body: "Review each order's answer, channel, and custom text.",
  },
  {
    to: "/app/analytics",
    heading: "Analytics",
    body: "See which channels drive orders and how response rate trends.",
  },
  {
    to: "/app/integrations",
    heading: "Integrations",
    body: "Connect attribution answers to the rest of your stack.",
  },
  {
    to: "/app/settings",
    heading: "Settings",
    body: "App preferences and Thank You page placement live here.",
  },
];

/** App home dashboard. General status only; each feature has its own page. */
export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Banner title="Post-purchase attribution" tone="info">
              <Text as="p">
                This app asks customers how they heard about you on the Thank
                You page. Open a section below to manage surveys, read
                responses, or review performance.
              </Text>
            </Banner>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Store snapshot
                </Text>
                <InlineGrid
                  columns={{ xs: 1, sm: 3 }}
                  gap="400"
                >
                  <BlockStack gap="100">
                    <Text as="p" tone="subdued">
                      Active surveys
                    </Text>
                    <Text as="p" variant="headingLg" fontWeight="bold">
                      {data.activeSurveys}
                    </Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="p" tone="subdued">
                      Total responses
                    </Text>
                    <Text as="p" variant="headingLg" fontWeight="bold">
                      {data.totalResponses.toLocaleString()}
                    </Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="p" tone="subdued">
                      Response rate
                    </Text>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="p" variant="headingLg" fontWeight="bold">
                        {data.responseRate}
                      </Text>
                      <Badge tone="success">{data.topChannel}</Badge>
                    </InlineStack>
                  </BlockStack>
                </InlineGrid>
              </BlockStack>
            </Card>

            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Go to
              </Text>
              <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="300">
                {NAV_TILES.map((tile) => (
                  <Link to={tile.to} key={tile.to} style={{ textDecoration: "none" }}>
                    <Box
                      padding="400"
                      background="bg-surface-secondary"
                      borderRadius="200"
                    >
                      <BlockStack gap="100">
                        <Text as="h3" variant="headingMd">
                          {tile.heading}
                        </Text>
                        <Text as="p" tone="subdued">
                          {tile.body}
                        </Text>
                      </BlockStack>
                    </Box>
                  </Link>
                ))}
              </InlineGrid>
            </BlockStack>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
