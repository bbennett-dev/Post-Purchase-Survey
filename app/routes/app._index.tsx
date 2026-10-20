import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { DashboardHome } from "../components/dashboard/DashboardHome";
import { loadDashboardSnapshot } from "../lib/dashboard/dashboard.server";
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { fetchCheckoutEditorLinks } from "../lib/shopify/checkout-editor-url.server";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/**
 * Authenticated dashboard loader — shop snapshot for the home page.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);
  const [snapshot, checkoutEditor] = await Promise.all([
    loadDashboardSnapshot(shop),
    fetchCheckoutEditorLinks(admin, session.shop),
  ]);
  return { snapshot, checkoutEditor, shopDomain: session.shop };
};

/** App home dashboard. Detailed workflows live on Surveys, Responses, and Settings. */
export default function Dashboard() {
  const { snapshot, checkoutEditor, shopDomain } = useLoaderData<typeof loader>();
  return (
    <DashboardHome
      snapshot={snapshot}
      checkoutEditor={checkoutEditor}
      shopDomain={shopDomain}
    />
  );
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
