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
import {
  formatQuestionsSummary,
  mapSurveyResponseToListItem,
} from "../lib/survey/response/response-api.mapper";
import {
  countSurveyResponsesForShop,
  listSurveyResponsesForShop,
} from "../lib/survey/response/survey-response.server";
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

function formatSubmittedAt(iso: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(iso);
}

function orderLabel(orderId: string, orderName: string | null): string {
  if (orderName?.trim()) {
    return orderName;
  }
  const match = orderId.match(/(\d+)\s*$/);
  if (match) {
    return `#${match[1]}`;
  }
  const tail = orderId.split("/").pop();
  return tail ? `#${tail}` : orderId;
}

function displayOrDash(value: string | null | undefined): string {
  return value?.trim() ? value.trim() : "—";
}

function customerLabel(
  name: string | null,
  email: string | null,
): string {
  const parts = [name?.trim(), email?.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

/**
 * Responses index loader — shop-scoped submissions (questions JSON + meta).
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<{ responses: ResponseRow[]; total: number }> => {
  const { session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);
  const [rows, total] = await Promise.all([
    listSurveyResponsesForShop(shop, { take: 100, skip: 0 }),
    countSurveyResponsesForShop(shop),
  ]);

  const responses: ResponseRow[] = rows.map((row) => {
    const dto = mapSurveyResponseToListItem(row);
    return {
      id: dto.id,
      orderName: orderLabel(dto.orderId, dto.orderName),
      customer: customerLabel(dto.customerName, dto.email),
      product: displayOrDash(dto.productName),
      surveyName: dto.surveyName,
      questionCount: dto.questions.length,
      answerSummary: formatQuestionsSummary(dto.questions),
      submittedAt: formatSubmittedAt(row.submittedAt),
    };
  });

  return { responses, total };
};

/** Response feed for Thank you / Order status submissions. */
export default function ResponsesPage() {
  const { responses, total } = useLoaderData<typeof loader>();

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
        total > 0
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
