import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  DataTable,
  EmptyState,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { listResponsesForAdminApi } from "../lib/survey/response/response-list-api.server";
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

interface ResponseRow {
  id: string;
  orderName: string;
  customer: string;
  product: string;
  surveyName: string;
  questionCount: number;
  answerSummary: string;
  submittedAt: string;
}

/**
 * Responses index loader — shop-scoped submissions (questions JSON + meta).
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<{
  responses: ResponseRow[];
  total: number;
  surveyFilter: string | null;
}> => {
  const { session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);
  const surveyFilter =
    new URL(request.url).searchParams.get("survey")?.trim() || null;
  const { items, total } = await listResponsesForAdminApi(
    shop,
    0,
    100,
    surveyFilter ?? undefined,
  );

  const responses: ResponseRow[] = items.map((item) => ({
    id: item.id,
    orderName: item.orderName,
    customer: item.customer,
    product: item.product,
    surveyName: item.surveyName,
    questionCount: item.questionCount,
    answerSummary: item.answerSummary,
    submittedAt: item.submittedAt,
  }));

  return { responses, total, surveyFilter };
};

/** Response feed for Thank you / Order status submissions. */
export default function ResponsesPage() {
  const { responses, total, surveyFilter } = useLoaderData<typeof loader>();

  const rows = responses.map((r) => [
    <Text key={`${r.id}-order`} as="span" fontWeight="semibold">
      {r.orderName}
    </Text>,
    r.customer,
    r.product,
    r.surveyName,
    <Badge key={`${r.id}-count`}>{`${r.questionCount} question${r.questionCount === 1 ? "" : "s"}`}</Badge>,
    <Text key={`${r.id}-summary`} as="span">
      {r.answerSummary}
    </Text>,
    r.submittedAt,
  ]);

  return (
    <Page
      title="Responses"
      subtitle={
        surveyFilter
          ? total > 0
            ? `${total} submission${total === 1 ? "" : "s"} for this survey`
            : "No submissions for this survey"
          : total > 0
            ? `${total} submission${total === 1 ? "" : "s"}`
            : "No submissions yet"
      }
      primaryAction={
        <Button url="/app/surveys" variant="primary">
          Manage surveys
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          {responses.length === 0 ? (
            <Card>
              <EmptyState
                heading="No responses yet"
                image="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                action={{
                  content: "Open surveys",
                  url: "/app/surveys",
                }}
              >
                <Text as="p">
                  When customers complete the Thank you or Order status survey,
                  every question answer is stored and listed here.
                </Text>
              </EmptyState>
            </Card>
          ) : (
            <Card padding="0">
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={[
                  "Order",
                  "Customer",
                  "Product",
                  "Survey",
                  "Questions",
                  "Answers",
                  "Submitted",
                ]}
                rows={rows}
              />
            </Card>
          )}
          <BlockStack gap="200">
            <Text as="p" tone="subdued">
              Each row is one order + survey submission. Order, customer, and
              product columns are filled when the channel sends context or Admin
              enrichment succeeds.
            </Text>
            <Text as="p" tone="subdued">
              Test: place an order, answer every step on Thank you, then refresh.{" "}
              <Link to="/app/surveys">Edit surveys</Link>
            </Text>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
