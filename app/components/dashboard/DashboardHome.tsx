import { Link } from "react-router";
import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Divider,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { DashboardExtensionStatusCard } from "./DashboardExtensionStatusCard";
import { DashboardSetupGuide } from "./DashboardSetupGuide";
import type { DashboardSnapshot } from "../../lib/dashboard/dashboard.server";
import { useExtensionPlacementStatus } from "../../hooks/useExtensionPlacementStatus";
import type { CheckoutEditorLinks } from "../../lib/shopify/checkout-editor-url.server";
import { responseDetailHref, responsesHref } from "../../lib/routes/responses-route";
import { useClientFormattedDate } from "../../lib/routes/use-client-formatted-date";
import { formatResponseSubmittedAt } from "../../lib/survey/response/response-list-formatters";

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text as="p" tone="subdued" variant="bodySm">
          {label}
        </Text>
        <Text as="p" variant="heading2xl">
          {value}
        </Text>
        {hint ? (
          <Text as="p" tone="subdued" variant="bodySm">
            {hint}
          </Text>
        ) : null}
      </BlockStack>
    </Card>
  );
}

function RecentResponseDate({ iso }: { iso: string }) {
  const formatted = useClientFormattedDate(iso, formatResponseSubmittedAt);
  return (
    <Text as="span" tone="subdued" variant="bodySm">
      {formatted || "—"}
    </Text>
  );
}

const QUICK_LINKS = [
  {
    heading: "Surveys",
    body: "Build questions, set channels, and publish to Thank You.",
    to: "/app/surveys",
    action: "Open surveys",
  },
  {
    heading: "Responses",
    body: "Browse submissions, archive old rows, and open full answers.",
    to: responsesHref({ view: "active" }),
    action: "View responses",
  },
  {
    heading: "Settings",
    body: "Checkout placement and app preferences.",
    to: "/app/settings",
    action: "Open settings",
  },
] as const;

/** Polaris home dashboard for post-purchase survey merchants. */
export function DashboardHome({
  snapshot,
  checkoutEditor,
  shopDomain,
}: {
  snapshot: DashboardSnapshot;
  checkoutEditor: CheckoutEditorLinks;
  shopDomain: string;
}) {
  const placementState = useExtensionPlacementStatus();
  const {
    liveSurveys,
    pausedSurveys,
    totalSurveys,
    totalResponses,
    activeResponses,
    responsesLast7Days,
    recentResponses,
  } = snapshot;

  const showLiveWarning = totalSurveys > 0 && liveSurveys === 0;

  return (
    <Page
      title="Dashboard"
      primaryAction={{
        content: "Manage surveys",
        url: "/app/surveys",
      }}
      secondaryActions={[
        {
          content: "View responses",
          url: responsesHref({ view: "active" }),
        },
      ]}
    >
      <BlockStack gap="500">
        <DashboardSetupGuide
          shopDomain={shopDomain}
          snapshot={snapshot}
          checkoutEditor={checkoutEditor}
          placementState={placementState}
        />

        {showLiveWarning ? (
          <Banner tone="warning" title="No live surveys">
            <Text as="p">
              Paused or draft surveys do not appear at checkout. Set at least
              one survey to live so shoppers can respond.
            </Text>
          </Banner>
        ) : null}

        <DashboardExtensionStatusCard
          checkoutEditor={checkoutEditor}
          placementState={placementState}
        />

        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
                <MetricCard
                  label="Live surveys"
                  value={liveSurveys.toLocaleString()}
                  hint={
                    pausedSurveys > 0
                      ? `${pausedSurveys} paused`
                      : `${totalSurveys} total`
                  }
                />
                <MetricCard
                  label="Active responses"
                  value={activeResponses.toLocaleString()}
                  hint={
                    totalResponses !== activeResponses
                      ? `${totalResponses.toLocaleString()} including archived`
                      : "Not archived"
                  }
                />
                <MetricCard
                  label="Last 7 days"
                  value={responsesLast7Days.toLocaleString()}
                  hint="New submissions"
                />
                <MetricCard
                  label="Paused surveys"
                  value={pausedSurveys.toLocaleString()}
                  hint="Not shown at checkout"
                />
              </InlineGrid>

              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Recent responses
                    </Text>
                    <Button
                      variant="plain"
                      url={responsesHref({ view: "active" })}
                    >
                      View all
                    </Button>
                  </InlineStack>

                  {recentResponses.length === 0 ? (
                    <Box paddingBlock="200">
                      <Text as="p" tone="subdued">
                        No responses yet. When customers complete your survey,
                        their latest submissions appear here.
                      </Text>
                    </Box>
                  ) : (
                    <BlockStack gap="0">
                      {recentResponses.map((item, index) => (
                        <Box key={item.id}>
                          {index > 0 ? <Divider /> : null}
                          <Link
                            to={responseDetailHref(item.id, {
                              view: "active",
                            })}
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            <Box paddingBlock="300">
                              <InlineStack
                                align="space-between"
                                blockAlign="start"
                                gap="400"
                              >
                                <BlockStack gap="100">
                                  <Text
                                    as="span"
                                    variant="bodyMd"
                                    fontWeight="semibold"
                                  >
                                    {item.displayId}
                                  </Text>
                                  <Text
                                    as="span"
                                    tone="subdued"
                                    variant="bodySm"
                                  >
                                    {item.surveyName}
                                  </Text>
                                </BlockStack>
                                <BlockStack gap="100" inlineAlign="end">
                                  <RecentResponseDate iso={item.submittedAt} />
                                  <Text
                                    as="span"
                                    tone="subdued"
                                    variant="bodySm"
                                  >
                                    {item.questionCount}{" "}
                                    {item.questionCount === 1
                                      ? "question"
                                      : "questions"}
                                  </Text>
                                </BlockStack>
                              </InlineStack>
                            </Box>
                          </Link>
                        </Box>
                      ))}
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    How it works
                  </Text>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm">
                      1. Create a survey and add attribution questions.
                    </Text>
                    <Text as="p" variant="bodySm">
                      2. Set the survey live for Thank You / order status.
                    </Text>
                    <Text as="p" variant="bodySm">
                      3. Review responses to see channels and custom answers.
                    </Text>
                  </BlockStack>
                  <Button url="/app/surveys/templates" variant="secondary">
                    Choose a template
                  </Button>
                </BlockStack>
              </Card>

              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Quick links
                </Text>
                {QUICK_LINKS.map((link) => (
                  <Card key={link.to}>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        {link.heading}
                      </Text>
                      <Text as="p" tone="subdued" variant="bodySm">
                        {link.body}
                      </Text>
                      <Box paddingBlockStart="100">
                        <Button url={link.to}>{link.action}</Button>
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
