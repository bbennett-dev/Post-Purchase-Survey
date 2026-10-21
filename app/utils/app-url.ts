/**
 * Production app URL for OAuth and embedded admin.
 * On Vercel, `SHOPIFY_APP_URL` can be omitted when `VERCEL_PROJECT_PRODUCTION_URL` is set.
 */
export function getAppUrl(): string {
  const explicit = process.env.SHOPIFY_APP_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) {
    return `https://${vercel}`;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}
