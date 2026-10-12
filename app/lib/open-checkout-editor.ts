/**
 * Opens a Shopify admin URL in a new browser tab from the embedded app.
 */
export function openShopifyAdminUrl(url: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
