import type { ReactNode } from "react";
import { PRIVACY_POLICY_META } from "./privacy-policy-sections";

const SUPPORT_EMAIL = PRIVACY_POLICY_META.supportEmail;

/**
 * Cloudflare (trycloudflare.com) rewrites bare emails in HTML, which breaks SSR
 * hydration. Explicit mailto links with `data-cfemail="false"` stay stable.
 */
export function renderPolicyText(text: string): ReactNode {
  if (!text.includes(SUPPORT_EMAIL)) {
    return text;
  }

  const parts = text.split(SUPPORT_EMAIL);
  const nodes: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(part);
    }
    if (index < parts.length - 1) {
      nodes.push(
        <a
          key={`support-email-${index}`}
          href={`mailto:${SUPPORT_EMAIL}`}
          data-cfemail="false"
        >
          {SUPPORT_EMAIL}
        </a>,
      );
    }
  });

  return nodes;
}
