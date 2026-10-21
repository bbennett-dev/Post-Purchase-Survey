import type { LinksFunction } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

/** Fixed public URLs (synced to public/styles on dev/build). */
const PUBLIC_STYLESHEETS = [
  "/styles/app-home.css",
  "/styles/privacy-legal.css",
] as const;

/**
 * Route `links()` keeps marketing CSS in React Router's head pipeline so SSR and
 * client `<Links />` output stay identical (avoids dev hydration head mismatch).
 */
export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://cdn.shopify.com/" },
  ...PUBLIC_STYLESHEETS.map((href) => ({ rel: "stylesheet", href })),
];

export default function App() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
