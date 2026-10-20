/** Checkout UI extension handle from `extensions/thank-you-survey/shopify.extension.toml`. */
export const CHECKOUT_UI_EXTENSION_HANDLE = "post-purchase-survey";

export const THANK_YOU_UI_TARGETS = new Set([
  "purchase.thank-you.block.render",
  "purchase.thank-you.announcement.render",
]);

export const ORDER_STATUS_UI_TARGETS = new Set([
  "customer-account.order-status.block.render",
  "customer-account.order-status.announcement.render",
]);

export type AppExtensionInfo = {
  handle: string;
  type: "ui_extension" | "theme_app_extension" | string;
  activations?: unknown[];
};

export type ThemeExtensionBlockActivation = {
  handle?: string;
  target?: string;
  status?: "active" | "available" | "unavailable" | string;
  activations?: { target?: string; themeId?: string }[];
};

export type UiExtensionActivation = {
  target?: string;
};

export interface ExtensionPlacementStatus {
  /** Thank you / order status checkout UI targets on the published profile. */
  thankYouActive: boolean;
  orderStatusActive: boolean;
  activeCheckoutBlockCount: number;
  /** Theme app embed (body) when a theme extension ships with the app. */
  themeAppEmbedActive: boolean | null;
  themeActiveBlockCount: number;
}

function uiActivations(
  extensions: AppExtensionInfo[],
): UiExtensionActivation[] {
  const match = extensions.find(
    (ext) =>
      ext.type === "ui_extension" &&
      ext.handle === CHECKOUT_UI_EXTENSION_HANDLE,
  );
  if (!match?.activations?.length) {
    return [];
  }
  return match.activations.filter(
    (item): item is UiExtensionActivation =>
      typeof item === "object" && item !== null && "target" in item,
  );
}

function themeExtensionBlocks(
  extensions: AppExtensionInfo[],
): ThemeExtensionBlockActivation[] {
  const match = extensions.find(
    (ext) => ext.type === "theme_app_extension",
  );
  if (!match?.activations?.length) {
    return [];
  }
  return match.activations.filter(
    (item): item is ThemeExtensionBlockActivation =>
      typeof item === "object" && item !== null,
  );
}

/**
 * Maps App Home `shopify.app.extensions()` payload to dashboard placement flags.
 * @see https://shopify.dev/docs/api/app-home/apis/authentication-and-data/app-api
 */
export function parseExtensionPlacementStatus(
  extensions: AppExtensionInfo[],
): ExtensionPlacementStatus {
  const ui = uiActivations(extensions);
  const thankYouActive = ui.some(
    (a) => a.target && THANK_YOU_UI_TARGETS.has(a.target),
  );
  const orderStatusActive = ui.some(
    (a) => a.target && ORDER_STATUS_UI_TARGETS.has(a.target),
  );

  const themeBlocks = themeExtensionBlocks(extensions);
  const themeEmbed = themeBlocks.find((block) => block.target === "body");
  const themeAppEmbedActive =
    themeBlocks.length === 0
      ? null
      : themeEmbed?.status === "active";
  const themeActiveBlockCount = themeBlocks.filter(
    (block) => block.status === "active",
  ).length;

  return {
    thankYouActive,
    orderStatusActive,
    activeCheckoutBlockCount: ui.length,
    themeAppEmbedActive,
    themeActiveBlockCount,
  };
}

/**
 * Competitor-style “App embed” toggle: theme body embed when present,
 * otherwise any published checkout UI placement (Thank you / Order status).
 */
export function isAppEmbedActive(placement: ExtensionPlacementStatus): boolean {
  if (placement.themeAppEmbedActive !== null) {
    return placement.themeAppEmbedActive;
  }
  return placement.thankYouActive || placement.orderStatusActive;
}

/** Count for the “Active app blocks” row (theme blocks vs checkout targets). */
export function activeAppBlockCount(placement: ExtensionPlacementStatus): number {
  if (placement.themeAppEmbedActive !== null) {
    return placement.themeActiveBlockCount;
  }
  return placement.activeCheckoutBlockCount;
}
