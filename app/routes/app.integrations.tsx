import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/**
 * Integrations route loader. Auth only until connection flows are designed.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

const integrations = [
  {
    name: "Klaviyo",
    detail: "Send the selected channel onto a customer profile.",
  },
  {
    name: "Google Sheets",
    detail: "Append each response to a spreadsheet.",
  },
  {
    name: "Webhooks",
    detail: "POST a payload to your own endpoint when an answer is saved.",
  },
];

/** Placeholder integrations list. Connect flows are not wired yet. */
export default function IntegrationsPage() {
  const shopify = useAppBridge();

  return (
    <s-page inlineSize="large">
      <s-section heading="Available connections">
        <s-stack direction="block" gap="base">
          {integrations.map((integration) => (
            <s-box
              key={integration.name}
              padding="base"
              border="base"
              borderRadius="base"
            >
              <s-grid
                gridTemplateColumns="1fr auto"
                gap="base"
                alignItems="center"
              >
                <s-stack direction="block" gap="small-200">
                  <s-stack
                    direction="inline"
                    gap="small-200"
                    alignItems="center"
                  >
                    <s-heading>{integration.name}</s-heading>
                    <s-badge tone="neutral">Not connected</s-badge>
                  </s-stack>
                  <s-paragraph>{integration.detail}</s-paragraph>
                </s-stack>
                <s-button
                  onClick={() =>
                    shopify.toast.show(`${integration.name} setup comes next`)
                  }
                >
                  Connect
                </s-button>
              </s-grid>
            </s-box>
          ))}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
