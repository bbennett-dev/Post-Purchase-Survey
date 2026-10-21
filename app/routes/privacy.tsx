import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { renderPolicyText } from "../lib/legal/render-policy-text";
import {
  PRIVACY_POLICY_DISCLAIMER,
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_META,
  PRIVACY_POLICY_SECTIONS,
} from "../lib/legal/privacy-policy-sections";

const BRAND_SHORT = "Post-Purchase Survey";
const BRAND_INITIALS = "PP";

export const meta: MetaFunction = () => [
  { title: `Privacy policy | ${BRAND_SHORT}` },
  {
    name: "description",
    content: PRIVACY_POLICY_INTRO,
  },
];

/**
 * Public privacy policy (no Shopify auth). Use this URL in the App Store listing.
 */
export default function PrivacyPolicyPage() {
  const year = new Date().getFullYear();

  return (
    <div className="ppl-root">
      <a className="ppl-skip" href="#main">
        Skip to content
      </a>

      <header className="ppl-header">
        <div className="ppl-headerInner">
          <Link className="ppl-brand" to="/">
            <span className="ppl-brandMark" aria-hidden>
              {BRAND_INITIALS}
            </span>
            {BRAND_SHORT}
          </Link>
          <Link className="ppl-headerCta" to="/#login">
            Open app
            <span aria-hidden>→</span>
          </Link>
        </div>
      </header>

      <div className="ppl-shell">
        <nav className="ppl-sectionNav" aria-label="Sections">
          <p className="ppl-sectionNavLabel">Legal</p>
          <ul className="ppl-sectionNavList">
            {PRIVACY_POLICY_SECTIONS.map((section) => (
              <li key={section.id}>
                <a className="ppl-sectionNavLink" href={`#${section.id}`}>
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main" className="ppl-article">
          <p className="ppl-eyebrow">Legal</p>
          <h1 className="ppl-title">Privacy policy</h1>
          <p className="ppl-lead">{PRIVACY_POLICY_INTRO}</p>
          <p className="ppl-metaLine">
            Last updated {PRIVACY_POLICY_META.effectiveDate}.
          </p>
          <p className="ppl-disclaimer">{PRIVACY_POLICY_DISCLAIMER}</p>

          {PRIVACY_POLICY_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="ppl-section"
              aria-labelledby={`${section.id}-heading`}
            >
              <h2 id={`${section.id}-heading`} className="ppl-sectionTitle">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p
                  className="ppl-paragraph"
                  key={`${section.id}-p-${index}`}
                >
                  {renderPolicyText(paragraph)}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="ppl-list">
                  {section.bullets.map((item, index) => (
                    <li key={`${section.id}-b-${index}`}>
                      {renderPolicyText(item)}
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.footerParagraphs?.map((paragraph, index) => (
                <p
                  className="ppl-paragraph"
                  key={`${section.id}-f-${index}`}
                >
                  {renderPolicyText(paragraph)}
                </p>
              ))}
            </section>
          ))}
        </main>
      </div>

      <footer className="ppl-footer">
        <div className="ppl-footerInner">
          <div>
            <p className="ppl-footerBrand">{BRAND_SHORT}</p>
            <p className="ppl-footerTagline">
              Post-purchase surveys inside Shopify checkout.
            </p>
          </div>
          <nav className="ppl-footerLinks" aria-label="Footer">
            <Link to="/privacy">Privacy</Link>
            <Link to="/">App home</Link>
          </nav>
          <p className="ppl-footerLegal">
            © {year} {PRIVACY_POLICY_META.legalEntity}. Not affiliated with
            Shopify Inc. Shopify is a trademark of Shopify Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
