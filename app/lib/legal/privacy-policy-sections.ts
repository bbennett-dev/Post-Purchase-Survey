/**
 * Public privacy policy sections (keep in sync with docs/legal/privacy-policy.md).
 */

export const PRIVACY_POLICY_META = {
  effectiveDate: "2026-10-10",
  appName: "IKEO Post-Purchase Survey",
  legalEntity: "IKEO",
  supportEmail: "ikeoapps@gmail.com",
  /** Public app URL without trailing slash */
  productionAppUrl: "https://post-purchase-survey-nine.vercel.app",
  privacyPath: "/privacy",
} as const;

export const PRIVACY_POLICY_PUBLIC_URL = `${PRIVACY_POLICY_META.productionAppUrl}${PRIVACY_POLICY_META.privacyPath}`;

export const PRIVACY_POLICY_INTRO =
  `${PRIVACY_POLICY_META.appName} collects post-purchase survey answers on behalf of the merchants who install it. This page sets out what we hold, why, who else sees it, and how it is deleted.`;

export type PrivacySection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  /** Rendered after bullets when both are present */
  footerParagraphs?: string[];
};

export const PRIVACY_POLICY_SECTIONS: PrivacySection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    paragraphs: [
      `The ${PRIVACY_POLICY_META.appName} app is operated by ${PRIVACY_POLICY_META.legalEntity}. The app is hosted at ${PRIVACY_POLICY_META.productionAppUrl}. For anything in this policy, write to ${PRIVACY_POLICY_META.supportEmail}.`,
      "Two roles matter. For survey answers your shoppers give, the merchant is the controller and we are the processor. We hold that data on your instructions so you can view responses in the app admin. For your merchant account (shop domain, OAuth session, survey drafts), we are the controller where we decide how that account data is stored and secured.",
    ],
  },
  {
    id: "shopify-access",
    title: "What the app reads from Shopify",
    paragraphs: [
      "At install, the app requests Shopify access scopes needed to run surveys on Thank you and Order status, publish configuration to your shop, and enrich responses when permitted. The current scopes include read access to orders, customers, and products; write access to customers (for display-recurrence metafields when you use those rules), metaobjects and metaobject definitions (to publish survey payloads for supported channels), and files (for merchant-uploaded assets such as survey images).",
      "We call the Shopify Admin API only from authenticated merchant sessions or documented app flows (for example enriching a response after checkout submit). We do not use buyer data for advertising and we do not sell it.",
    ],
  },
  {
    id: "merchant-data",
    title: "What we store about you, the merchant",
    bullets: [
      "Your myshopify.com domain and OAuth session records (access token and related session fields) so the embedded admin app and webhooks work.",
      "Your surveys (editor JSON), publish status (live or paused), and response counts.",
      "Shop-scoped settings needed to operate the app.",
      "Webhook delivery is handled by Shopify; we process topics configured in the app (including mandatory GDPR topics and app lifecycle events).",
    ],
  },
  {
    id: "shopper-data",
    title: "What we store about your shoppers",
    paragraphs: [
      "When a shopper submits a survey on Thank you or Order status (checkout UI extension), we record their answers together with context that helps you analyze attribution:",
    ],
    bullets: [
      "Survey answers (choices, text, ratings, dates, consent steps, and file or image URLs when you use those question types).",
      "Shopify order id for the purchase (one stored response per shop, survey, and order).",
      "Optional customer id and email when Shopify and your permissions provide them, or when enrichment from the Admin API fills gaps.",
      "Order name, product and variant context, country or region, device type, channel and page type (thank-you vs order-status), and completion metrics when the extension sends them.",
    ],
    footerParagraphs: [
      "The checkout extension uses Shopify-issued session tokens for submit requests; we do not set marketing cookies or tracking pixels in checkout for survey collection.",
      "If you add questions that ask for email, phone, or other free-text PII, whatever the shopper enters is stored like any other answer and may be personal data you must handle under your privacy obligations.",
    ],
  },
  {
    id: "integrations",
    title: "Integrations and forwarding",
    paragraphs: [
      "By default, responses are stored in our database and shown to you in the app admin. Third-party marketing or analytics integrations may be offered in future versions; unless you connect one and we document what it sends, we do not forward responses to external tools.",
    ],
  },
  {
    id: "subprocessors",
    title: "Who else sees it",
    paragraphs: [
      "We use sub-processors only as needed to run the app:",
      "We do not sell data, we do not share it with advertising networks, and we do not build cross-merchant shopper profiles for ads. Your shop's responses belong to you.",
      `A detailed sub-processor list is available on request at ${PRIVACY_POLICY_META.supportEmail}.`,
    ],
    bullets: [
      "Shopify — checkout, admin embed, OAuth, webhooks, and metafields or metaobjects your configuration uses.",
      "Vercel — application hosting for the app backend and admin UI.",
      "Neon (or your configured PostgreSQL provider) — encrypted database storage for shops, surveys, sessions, and responses.",
    ],
  },
  {
    id: "billing",
    title: "Billing",
    paragraphs: [
      "If paid plans are offered, they will be billed through Shopify App Pricing where applicable. You would approve charges on Shopify's hosted billing page; they would appear on your Shopify invoice. We do not operate a separate card checkout for app subscriptions unless we state otherwise in the app.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    bullets: [
      "Survey responses and survey definitions are kept while the app is installed and needed to provide the service, until you delete them in the app where that action is available, or until erasure webhooks or uninstall flows remove them.",
      "When you uninstall, Shopify notifies us and we delete shop survey data and sessions tied to your store.",
      "Shopify later sends shop/redact; we delete remaining shop-owned survey and response data and sessions for that shop.",
      "Deleting or archiving responses in the admin (where supported) limits what you see in reporting but follow your plan and product behavior for physical deletion.",
    ],
  },
  {
    id: "gdpr",
    title: "Deletion and data requests",
    paragraphs: [
      "Besides operational webhooks (app uninstalled, scopes update), we implement Shopify's mandatory privacy webhooks:",
      "Shoppers should contact your store first. If a shopper contacts us directly, we will ask them to contact you and we will notify you when appropriate.",
      `Merchants may email ${PRIVACY_POLICY_META.supportEmail} for help exporting or deleting data we hold for their shop.`,
    ],
    bullets: [
      "customers/data_request — we compile survey responses we hold for that customer (by customer id and/or email when provided) so you can fulfill the buyer's request. Contact us at the support email below if you need help retrieving an export.",
      "customers/redact — we delete survey responses linked to that customer for your shop.",
      "shop/redact — we delete the shop's app data (surveys, responses, sessions) from our database.",
    ],
  },
  {
    id: "legal-basis",
    title: "Legal basis and transfers",
    paragraphs: [
      "Where the GDPR or similar laws apply, we process shopper responses on your instruction as processor (typically under Article 28 via your use of the app). We process merchant account data to perform our contract with you and to secure the service.",
      "Data may be processed in regions where our hosting providers operate (including the United States and the European Union). We use appropriate safeguards where required by applicable law.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "We use HTTPS in transit, Shopify webhook HMAC verification, checkout session token authentication for public survey submit APIs, and Shopify admin authentication for merchant routes. Production database access is limited to authorized personnel.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: [
      `${PRIVACY_POLICY_META.legalEntity}`,
      `Email: ${PRIVACY_POLICY_META.supportEmail}`,
    ],
  },
  {
    id: "changes",
    title: "Changes",
    paragraphs: [
      `If we change what we collect or who processes it, we will update this page and change the date at the top. Material changes affecting merchants may also be communicated via the email on your Shopify account or in-app notice where practical.`,
      `Current version: ${PRIVACY_POLICY_PUBLIC_URL} · Effective ${PRIVACY_POLICY_META.effectiveDate}.`,
    ],
  },
];

export const PRIVACY_POLICY_DISCLAIMER =
  "This policy describes how the app handles data. It is not legal advice. Have qualified counsel review before you rely on it for compliance or App Store submission.";
