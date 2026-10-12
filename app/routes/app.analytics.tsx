import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Link } from "react-router";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/**
 * Analytics route loader. Auth only for now; charts land when we design this page.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

/** Placeholder analytics page until channel charts and date ranges are designed. */
export default function AnalyticsPage() {
  return (
    <Page title="Analytics">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="p" tone="subdued">
                This page will show response rate, top channels, and how
                attribution changes over time. Charts and filters come in the
                next design pass.
              </Text>
              <Text as="p" tone="subdued">
                Individual answers stay on{" "}
                <Link to="/app/responses">Responses</Link>. Survey setup stays
                on <Link to="/app/surveys">Surveys</Link>.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
