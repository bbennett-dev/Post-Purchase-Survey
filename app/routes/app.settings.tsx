import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { SettingsHome } from "../components/settings/SettingsHome";
import { fetchCheckoutEditorLinks } from "../lib/shopify/checkout-editor-url.server";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/**
 * Settings loader — checkout editor deep links for placement actions.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const checkoutEditor = await fetchCheckoutEditorLinks(admin, session.shop);
  return { checkoutEditor };
};

/** Shop preferences, placement guidance, and privacy summary for App Store review. */
export default function SettingsPage() {
  const { checkoutEditor } = useLoaderData<typeof loader>();
  return <SettingsHome checkoutEditor={checkoutEditor} />;
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
