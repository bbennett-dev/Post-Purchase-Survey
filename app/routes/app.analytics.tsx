import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
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
    <s-page inlineSize="large">
      <s-section heading="Analytics">
        <s-paragraph>
          This page will show response rate, top channels, and how attribution
          changes over time. We will design the charts and filters on the next
          pass.
        </s-paragraph>
        <s-paragraph>
          Individual answers stay on{" "}
          <s-link href="/app/responses">Responses</s-link>. Survey setup stays
          on <s-link href="/app/surveys">Surveys</s-link>.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
