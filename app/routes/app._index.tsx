import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import {
  Banner,
  BlockStack,
  Box,
  Card,
  InlineGrid,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { SurveyStatus } from "@prisma/client";
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

interface DashboardLoaderData {
  activeSurveys: number;
  totalResponses: number;
}

/**
 * Authenticated dashboard loader.
 * Returns a short shop snapshot. Detailed screens live on their own routes.
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  const { session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);
  const prisma = (await import("../db.server")).default;

  const [activeSurveys, totalResponses] = await Promise.all([
    prisma.survey.count({
      where: { shopId: shop.shopId, status: SurveyStatus.live },
    }),
    prisma.surveyResponse.count({
      where: { shopId: shop.shopId },
    }),
  ]);

  return { activeSurveys, totalResponses };
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
                <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                  <BlockStack gap="100">
                    <Text as="p" tone="subdued">
                      Live surveys
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
