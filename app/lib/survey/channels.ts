import { V1_APP_STORE_SCOPE, V1_CHANNEL_KEYS } from "../v1-product";

/**
 * Stable channel catalog for the Channel tab.
 * Keys match survey.channels in the survey document.
 */

export type ChannelIcon =
  | "cart"
  | "page"
  | "layout-popup"
  | "email"
  | "exit"
  | "code"
  | "email-newsletter"
  | "point-of-sale";

export interface ChannelDefinition {
  key: string;
  label: string;
  icon: ChannelIcon;
  /** Shown with a star; recommended first channel for merchants. */
  recommended?: boolean;
  /** Star hover tooltip (competitor: response rate hint). */
  recommendedTooltip?: { line1: string; line2?: string };
  /** When false, the row has no enable switch (link-only channels). */
  hasToggle?: boolean;
}

/**
 * Display order matches the product Channel list.
 * surveyForm exists on some documents but is not shown in this tab yet.
 */
export const CHANNEL_DEFINITIONS: ChannelDefinition[] = [
  {
    key: "postPurchasePage",
    label: "Thank you page",
    icon: "cart",
    recommended: true,
    recommendedTooltip: {
      line1: "Highest response rate",
      line2: "(~30%)",
    },
    hasToggle: true,
  },
  {
    key: "dedicatedPageSurvey",
    label: "Branded survey page",
    icon: "page",
    hasToggle: false,
  },
  {
    key: "siteWidget",
    label: "On-site survey",
    icon: "layout-popup",
    hasToggle: true,
  },
  {
    key: "postPurchaseEmail",
    label: "Post-purchase email",
    icon: "email",
    hasToggle: true,
  },
  {
    key: "exitIntent",
    label: "Exit intent",
    icon: "exit",
    hasToggle: true,
  },
  {
    key: "embedSurvey",
    label: "Embed survey",
    icon: "code",
    hasToggle: true,
  },
  {
    key: "embedEmail",
    label: "Embed email",
    icon: "email-newsletter",
    hasToggle: true,
  },
  {
    key: "posPage",
    label: "Point of Sale",
    icon: "point-of-sale",
    hasToggle: true,
  },
];

export const CHANNEL_LABELS: Record<string, string> = Object.fromEntries(
  CHANNEL_DEFINITIONS.map((channel) => [channel.key, channel.label]),
);

/** Channel rows shown in the survey editor (v1-gated). */
export function channelDefinitionsForEditor(): ChannelDefinition[] {
  if (!V1_APP_STORE_SCOPE) {
    return CHANNEL_DEFINITIONS;
  }
  const allowed = new Set<string>(V1_CHANNEL_KEYS);
  return CHANNEL_DEFINITIONS.filter((channel) => allowed.has(channel.key));
}

/** Resolves a channel definition for inspector headers (respects v1 gating). */
export function channelDefinitionByKey(
  channelKey: string,
): ChannelDefinition | undefined {
  return channelDefinitionsForEditor().find((item) => item.key === channelKey);
}

/** First channel key to select when opening the Channel tab (editor UI only). */
export function defaultEditorChannelKey(
  survey?: { channels?: Record<string, unknown> },
): string | null {
  const fromCatalog = channelDefinitionsForEditor()[0]?.key;
  if (fromCatalog) {
    return fromCatalog;
  }
  const keys = Object.keys(survey?.channels ?? {});
  return keys[0] ?? null;
}
