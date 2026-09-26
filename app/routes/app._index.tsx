import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
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
 * Returns a short shop snapshot. Detailed survey, response, and analytics
 * screens live on their own routes and stay mocked until those pages are built out.
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

/**
 * SnapPlux home. General status only; each feature has its own navigation page.
 */
export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  return (
    <s-page inlineSize="large">
      <s-banner heading="Post-purchase attribution" tone="info">
        SnapPlux asks customers how they heard about you on the Thank You page.
        Open a section below to manage surveys, read responses, or review
        performance.
      </s-banner>

      <s-section heading="Store snapshot">
        <s-query-container>
          <s-grid
            gridTemplateColumns="@container (inline-size <= 400px) 1fr, 1fr auto 1fr auto 1fr"
            gap="small"
          >
            <s-box paddingBlock="small-400" paddingInline="small-100">
              <s-grid gap="small-300">
                <s-heading>Active surveys</s-heading>
                <s-text type="strong">{data.activeSurveys}</s-text>
              </s-grid>
            </s-box>
            <s-divider direction="block" />
            <s-box paddingBlock="small-400" paddingInline="small-100">
              <s-grid gap="small-300">
                <s-heading>Total responses</s-heading>
                <s-text type="strong">
                  {data.totalResponses.toLocaleString()}
                </s-text>
              </s-grid>
            </s-box>
            <s-divider direction="block" />
            <s-box paddingBlock="small-400" paddingInline="small-100">
              <s-grid gap="small-300">
                <s-heading>Response rate</s-heading>
                <s-stack direction="inline" gap="small-200" alignItems="center">
                  <s-text type="strong">{data.responseRate}</s-text>
                  <s-badge tone="success">{data.topChannel}</s-badge>
                </s-stack>
              </s-grid>
            </s-box>
          </s-grid>
        </s-query-container>
      </s-section>

      <s-section heading="Go to">
        <s-grid
          gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
          gap="base"
        >
          <s-clickable href="/app/surveys" padding="base" background="subdued">
            <s-heading>Surveys</s-heading>
            <s-paragraph>
              Create and manage the questions shown after checkout.
            </s-paragraph>
          </s-clickable>
          <s-clickable href="/app/responses" padding="base" background="subdued">
            <s-heading>Responses</s-heading>
            <s-paragraph>
              Review each order&apos;s answer, channel, and custom text.
            </s-paragraph>
          </s-clickable>
          <s-clickable href="/app/analytics" padding="base" background="subdued">
            <s-heading>Analytics</s-heading>
            <s-paragraph>
              See which channels drive orders and how response rate trends.
            </s-paragraph>
          </s-clickable>
          <s-clickable
            href="/app/integrations"
            padding="base"
            background="subdued"
          >
            <s-heading>Integrations</s-heading>
            <s-paragraph>
              Connect attribution answers to the rest of your stack.
            </s-paragraph>
          </s-clickable>
          <s-clickable href="/app/settings" padding="base" background="subdued">
            <s-heading>Settings</s-heading>
            <s-paragraph>
              App preferences and Thank You page placement live here.
            </s-paragraph>
          </s-clickable>
        </s-grid>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
