import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
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

  return (
    <s-page inlineSize="large">
      <s-section padding="none" accessibilityLabel="Responses list">
        <s-box padding="base">
          <s-grid
            gridTemplateColumns="1fr auto"
            gap="base"
            alignItems="center"
          >
            <s-heading>Responses</s-heading>
            <s-button
              variant="primary"
              onClick={() => shopify.toast.show("CSV export comes next")}
            >
              Export to CSV
            </s-button>
          </s-grid>
        </s-box>

        {responses.length === 0 ? (
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-stack alignItems="center">
              <s-heading>No responses yet</s-heading>
              <s-paragraph>
                Answers from the Thank You page will show up here, one row per
                order.
              </s-paragraph>
            </s-stack>
            <s-button href="/app/surveys">Review surveys</s-button>
          </s-grid>
        ) : (
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Order</s-table-header>
              <s-table-header>Survey</s-table-header>
              <s-table-header>Channel</s-table-header>
              <s-table-header>Custom text</s-table-header>
              <s-table-header listSlot="labeled">Submitted</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {responses.map((response) => (
                <s-table-row key={response.id}>
                  <s-table-cell>
                    <s-text type="strong">{response.orderName}</s-text>
                  </s-table-cell>
                  <s-table-cell>{response.surveyName}</s-table-cell>
                  <s-table-cell>{response.selectedChannel}</s-table-cell>
                  <s-table-cell>
                    {response.customText ? (
                      <s-text>{response.customText}</s-text>
                    ) : (
                      <s-text color="subdued">—</s-text>
                    )}
                  </s-table-cell>
                  <s-table-cell>{response.submittedAt}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
