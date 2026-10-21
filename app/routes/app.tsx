import type { HeadersFunction, LinksFunction, LoaderFunctionArgs } from "react-router";
import { polarisDocumentLinks } from "../lib/styles/document-links";
import { Outlet, useLoaderData, useLocation, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import { AppHydrationShell } from "../components/AppHydrationShell";
import { PolarisRouterLink } from "../components/PolarisRouterLink";
import { EditorModalProvider } from "../lib/editor-modal";
import { authenticate } from "../shopify.server";

/** Polaris + Inter only on embedded admin routes (keeps public `/` head stable). */
export const links: LinksFunction = () => [...polarisDocumentLinks()];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const location = useLocation();
  const isSurveyEditor = location.pathname.includes("/surveys/editor");

  return (
    <ShopifyAppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={en} linkComponent={PolarisRouterLink}>
        {isSurveyEditor ? null : (
          // App Home WC: platform nav matches Shopify RR template; App Bridge handles in-app routing.
          <s-app-nav>
            <s-link href="/app">Dashboard</s-link>
            <s-link href="/app/surveys">Surveys</s-link>
            <s-link href="/app/responses">Responses</s-link>
            <s-link href="/app/settings">Settings</s-link>
          </s-app-nav>
        )}
        <AppHydrationShell>
          {isSurveyEditor ? (
            <Outlet />
          ) : (
            <EditorModalProvider>
              <Outlet />
            </EditorModalProvider>
          )}
        </AppHydrationShell>
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
