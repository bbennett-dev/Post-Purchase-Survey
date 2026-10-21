/**
 * Production app URL for OAuth and embedded admin.
 * On Vercel, `SHOPIFY_APP_URL` can be omitted when `VERCEL_PROJECT_PRODUCTION_URL` is set.
 */
function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, "");
}

/** Non-empty env value, or undefined when missing/blank. */
function envOrUndefined(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getAppUrl(): string {
  const explicit = envOrUndefined("SHOPIFY_APP_URL");
  if (explicit) {
    return normalizeOrigin(explicit);
  }

  const vercelProduction = envOrUndefined("VERCEL_PROJECT_PRODUCTION_URL");
  if (vercelProduction) {
    const host = vercelProduction.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  const vercelUrl = envOrUndefined("VERCEL_URL");
  if (vercelUrl) {
    const host = vercelUrl.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}
