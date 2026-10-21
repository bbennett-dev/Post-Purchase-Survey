/** Shared stylesheet URLs for route `links()` exports (Polaris admin + auth). */

export const POLARIS_REACT_STYLESHEET = "/polaris-react.css";

export const SHOPIFY_INTER_FONT =
  "https://cdn.shopify.com/static/fonts/inter/v4/styles.css";

export const polarisDocumentLinks = () =>
  [
    { rel: "stylesheet" as const, href: POLARIS_REACT_STYLESHEET },
    { rel: "stylesheet" as const, href: SHOPIFY_INTER_FONT },
  ] as const;
