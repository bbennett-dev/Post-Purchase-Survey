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
