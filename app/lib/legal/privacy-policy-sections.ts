/** Public privacy policy sections (keep in sync with docs/legal/privacy-policy.md). */

export const PRIVACY_POLICY_META = {
  effectiveDate: "[Effective date]",
  appName: "Post-Purchase Survey (HDYHAU)",
  legalEntity: "[Legal entity name]",
  supportEmail: "[Support email]",
  address: "[Physical address or registered office]",
  privacyPath: "/privacy",
} as const;

export type PrivacySection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export const PRIVACY_POLICY_SECTIONS: PrivacySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    paragraphs: [
      `${PRIVACY_POLICY_META.legalEntity} ("we", "us") provides the ${PRIVACY_POLICY_META.appName} application for Shopify merchants. Merchants use the app to collect post-purchase feedback from their customers. This policy explains how we process personal data when merchants install and use the app.`,
      "Merchants are the data controllers for their customers' personal data. We act as a data processor, storing and displaying survey responses and related order context on the merchant's instructions.",
    ],
  },
  {
    id: "data",
    title: "Data we process",
    paragraphs: ["We may process the following categories of data:"],
    bullets: [
      "Survey answers (choices, text, ratings, dates, file URLs for upload questions)",
      "Order id and order name",
      "Customer email, name, and customer id when Shopify permits access",
      "Product/variant context, country, device type, and completion metrics",
      "Merchant staff session data required to operate the embedded admin app",
    ],
  },
  {
    id: "purposes",
    title: "Purposes",
    bullets: [
      "Provide survey collection, storage, and merchant reporting",
      "Operate checkout and order-status UI extensions",
      "Improve app reliability and performance",
      "Honor GDPR mandatory webhooks and legal obligations",
    ],
  },
  {
    id: "no-sale",
    title: "No sale of personal data",
    paragraphs: [
      "We do not sell personal data and do not use buyer survey data for third-party advertising.",
    ],
  },
  {
    id: "retention",
    title: "Retention and deletion",
    bullets: [
      "Data is kept while the app is installed and needed to provide the service",
      "Uninstall and shop/redact delete shop surveys and responses from our database",
      "customers/redact deletes responses linked to the customer id or email we store",
      "customers/data_request triggers compilation of stored survey responses to help the merchant respond within 30 days",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "We use HTTPS, Shopify webhook HMAC verification, checkout session tokens for public survey APIs, and admin authentication for merchant routes. Access to production data is limited to authorized personnel.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    paragraphs: [
      "Buyers should contact the merchant store first. Merchants may email us for help exporting or deleting data we hold for their shop.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: [
      `Email: ${PRIVACY_POLICY_META.supportEmail}`,
      `Address: ${PRIVACY_POLICY_META.address}`,
    ],
  },
  {
    id: "changes",
    title: "Changes",
    paragraphs: [
      `We may update this policy. The current version is published at ${PRIVACY_POLICY_META.privacyPath} with effective date ${PRIVACY_POLICY_META.effectiveDate}.`,
    ],
  },
];

export const PRIVACY_POLICY_DISCLAIMER =
  "This policy is provided for transparency about the app. It is not legal advice. Have qualified counsel review before relying on it for compliance.";
