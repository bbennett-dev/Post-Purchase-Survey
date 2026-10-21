import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, redirect, useLoaderData } from "react-router";
import { PRIVACY_POLICY_META } from "../../lib/legal/privacy-policy-sections";
import { login } from "../../shopify.server";

const BRAND = "Post-Purchase Survey";
const TAGLINE =
  "Ask “How did you hear about us?” on Thank you and Order status — inside Shopify checkout, not a clunky redirect.";

export const meta: MetaFunction = () => [
  { title: `${BRAND} · HDYHAU surveys for Shopify` },
  { name: "description", content: TAGLINE },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

const FEATURES = [
  {
    icon: "🛒",
    title: "Checkout-native placement",
    text: "Block or announcement bar on Thank you and Order status — where buyers actually are after purchase.",
  },
  {
    icon: "📊",
    title: "Responses tied to orders",
    text: "See attribution answers alongside order context in your admin. One response per order, no duplicates.",
  },
  {
    icon: "🔒",
    title: "Built for compliance",
    text: "Shopify session tokens at checkout, GDPR webhooks, and a public privacy policy merchants can trust.",
  },
] as const;

const STEPS = [
  {
    title: "Install on your dev or live store",
    text: "Open the app from Shopify Admin and connect your shop domain.",
  },
  {
    title: "Publish a live survey",
    text: "Design questions in the editor, set status to Live, and enable the checkout extension.",
  },
  {
    title: "Read attribution in Responses",
    text: "Every submission lands in one place — ready for HDYHAU reporting.",
  },
] as const;

/**
 * Public app home: merchant login + product overview (embedded app entry).
 */
export default function AppHomePage() {
  const { showForm } = useLoaderData<typeof loader>();
  const year = new Date().getFullYear();

  return (
    <div className="aph-root">
      <header className="aph-header">
        <div className="aph-headerInner">
          <Link className="aph-brand" to="/">
            <span className="aph-brandMark" aria-hidden>
              PP
            </span>
            {BRAND}
          </Link>
          <nav className="aph-nav" aria-label="Primary">
            <a href="#features">Features</a>
            <Link to="/privacy">Privacy</Link>
            <a className="aph-navCta" href="#login">
              Log in
            </a>
          </nav>
        </div>
      </header>

      <section className="aph-hero">
        <div className="aph-heroGlow" aria-hidden />
        <div className="aph-heroCopy">
          <div className="aph-badge">
            <span className="aph-badgeDot" aria-hidden />
            HDYHAU · Shopify checkout
          </div>
          <h1 className="aph-title">
            Know where sales{" "}
            <span className="aph-titleAccent">really come from</span>
          </h1>
          <p className="aph-subtitle">{TAGLINE}</p>

          {showForm ? (
            <div className="aph-loginCard" id="login">
              <p className="aph-loginTitle">Log in with your store</p>
              <p className="aph-loginHint">
                Merchants only — enter your{" "}
                <strong>myshopify.com</strong> domain to open the embedded app.
              </p>
              <Form className="aph-form" method="post" action="/auth/login">
                <div className="aph-formRow">
                  <label className="aph-label" htmlFor="shop-domain">
                    Shop domain
                    <input
                      id="shop-domain"
                      className="aph-input"
                      type="text"
                      name="shop"
                      placeholder="your-store.myshopify.com"
                      autoComplete="off"
                      required
                    />
                  </label>
                  <button className="aph-submit" type="submit">
                    Continue
                  </button>
                </div>
              </Form>
            </div>
          ) : (
            <p className="aph-subtitle">
              Open this app from your Shopify Admin to get started.
            </p>
          )}
        </div>

        <div className="aph-heroVisual" aria-hidden>
          <div className="aph-mockCard">
            <div className="aph-mockHeader">
              <div className="aph-mockDots">
                <span />
                <span />
                <span />
              </div>
              Thank you · Order #1042
            </div>
            <p className="aph-mockTitle">Thanks for your order!</p>
            <p className="aph-mockQuestion">How did you hear about us?</p>
            <div className="aph-mockOptions">
              <div className="aph-mockOption aph-mockOptionActive">
                Instagram / social
              </div>
              <div className="aph-mockOption">Google search</div>
              <div className="aph-mockOption">Friend or family</div>
            </div>
            <span className="aph-mockBtn">Submit answer</span>
          </div>
        </div>
      </section>

      <section className="aph-features" id="features">
        <p className="aph-sectionLabel">Why merchants choose it</p>
        <h2 className="aph-sectionTitle">
          Post-purchase surveys without leaving checkout
        </h2>
        <div className="aph-featureGrid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="aph-featureCard">
              <div className="aph-featureIcon">{feature.icon}</div>
              <h3 className="aph-featureTitle">{feature.title}</h3>
              <p className="aph-featureText">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="aph-steps">
        <p className="aph-sectionLabel">Get started</p>
        <h2 className="aph-sectionTitle">Live in three steps</h2>
        <ol className="aph-stepsList">
          {STEPS.map((step, index) => (
            <li key={step.title} className="aph-step">
              <span className="aph-stepNum">{index + 1}</span>
              <div className="aph-stepBody">
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="aph-footer">
        <div className="aph-footerInner">
          <span>
            © {year} {PRIVACY_POLICY_META.legalEntity} · {BRAND}
          </span>
          <div className="aph-footerLinks">
            <Link to="/privacy">Privacy policy</Link>
            <a href={`mailto:${PRIVACY_POLICY_META.supportEmail}`}>
              {PRIVACY_POLICY_META.supportEmail}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
