import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

interface ResponseRow {
  id: string;
  orderName: string;
  surveyName: string;
  selectedChannel: string;
  customText?: string;
  submittedAt: string;
}

/**
 * Responses index loader. Mock submissions stand in until response persistence exists.
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<{ responses: ResponseRow[] }> => {
  await authenticate.admin(request);

  return {
    responses: [
      {
        id: "resp_1",
        orderName: "#1042",
        surveyName: "Post-purchase HDYHAU",
        selectedChannel: "Instagram",
        submittedAt: "Sep 21, 9:14 AM",
      },
      {
        id: "resp_2",
        orderName: "#1041",
        surveyName: "Post-purchase HDYHAU",
        selectedChannel: "TikTok",
        submittedAt: "Sep 21, 8:02 AM",
      },
      {
        id: "resp_3",
        orderName: "#1039",
        surveyName: "Post-purchase HDYHAU",
        selectedChannel: "Other",
        customText: "Podcast ad on Marketing School",
        submittedAt: "Sep 20, 9:45 PM",
      },
    ],
  };
};

/** Response feed. Filters, export, and order links come in a later pass. */
export default function ResponsesPage() {
  const { responses } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const rows = responses.map((r) => [
    <Text key={`${r.id}-order`} as="span" fontWeight="semibold">
      {r.orderName}
    </Text>,
    r.surveyName,
    <Badge key={`${r.id}-channel`}>{r.selectedChannel}</Badge>,
    r.customText ? (
      <Text as="span">{r.customText}</Text>
    ) : (
      <Text as="span" tone="subdued">
        —
      </Text>
    ),
    r.submittedAt,
  ]);

  return (
    <Page
      title="Responses"
      primaryAction={
        <Button
          variant="primary"
          onClick={() => shopify.toast.show("CSV export comes next")}
        >
          Export to CSV
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {responses.length === 0 ? (
              <EmptyState
                heading="No responses yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <Text as="p">
                  Answers from the Thank You page will show up here, one row
                  per order.
                </Text>
                <Link to="/app/surveys">Review surveys</Link>
              </EmptyState>
            ) : (
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={[
                  "Order",
                  "Survey",
                  "Channel",
                  "Custom text",
                  "Submitted",
                ]}
                rows={rows}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
