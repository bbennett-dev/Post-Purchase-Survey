import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/**
 * Settings route loader. Auth only until merchant preferences are designed.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

/** Placeholder settings page. Preference controls come in a later pass. */
export default function SettingsPage() {
  return (
    <s-page inlineSize="large">
      <s-section heading="Thank You page">
        <s-paragraph>
          Placement of the SnapPlux block on the order status page will be
          configured here, along with the default question and whether the
          survey is shown.
        </s-paragraph>
      </s-section>
      <s-section heading="Account">
        <s-paragraph>
          Shop-level preferences such as timezone and export defaults will live
          in this section once we design them.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
