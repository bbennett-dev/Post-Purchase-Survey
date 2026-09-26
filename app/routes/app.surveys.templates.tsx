import { boundary } from "@shopify/shopify-app-react-router/server";
import { openSurveyEditor } from "../lib/open-survey-editor";
import { useMemo, useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

type TemplateCategory = "attribution" | "experience" | "feedback";
type CategoryView = "all" | TemplateCategory;
type TemplateBadge = "most_popular" | "recommended" | "new";
type TemplateIcon =
  | "plus-circle"
  | "megaphone"
  | "target"
  | "order-repeat"
  | "gift-card"
  | "email"
  | "product"
  | "delivery"
  | "smiley-happy"
  | "organization";

interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  questionCount: number;
  estimatedSeconds: number;
  surface: "Thank you" | "Order status";
  audience: string;
  badge?: TemplateBadge;
  icon: TemplateIcon;
  questions: string[];
}

interface TemplatesLoaderData {
  templates: SurveyTemplate[];
}

const CATEGORIES: { id: CategoryView; label: string }[] = [
  { id: "all", label: "All" },
  { id: "attribution", label: "Attribution" },
  { id: "experience", label: "Experience" },
  { id: "feedback", label: "Feedback" },
];

/**
 * Template picker loader.
 * Catalog stays in-app until survey drafts persist; authenticate so the
 * route stays inside the embedded admin session.
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<TemplatesLoaderData> => {
  await authenticate.admin(request);

  return {
    templates: [
      {
        id: "blank",
        name: "Blank survey",
        description:
          "Start empty and write the exact questions you want after checkout.",
        category: "attribution",
        questionCount: 0,
        estimatedSeconds: 120,
        surface: "Thank you",
        audience: "Any buyer",
        icon: "plus-circle",
        questions: [],
      },
      {
        id: "hdyhau",
        name: "How did you hear about us?",
        description:
          "Find which channel sent the order. The default post-purchase survey.",
        category: "attribution",
        questionCount: 2,
        estimatedSeconds: 15,
        surface: "Thank you",
        audience: "New buyers",
        badge: "most_popular",
        icon: "megaphone",
        questions: [
          "How did you hear about us?",
          "If you chose Other, tell us a little more.",
        ],
      },
      {
        id: "campaign",
        name: "Campaign attribution",
        description:
          "Ask which ad, email, or promo brought the customer to this order.",
        category: "attribution",
        questionCount: 2,
        estimatedSeconds: 20,
        surface: "Thank you",
        audience: "New buyers",
        icon: "target",
        questions: [
          "Which campaign sent you here?",
          "Was a discount code part of why you bought?",
        ],
      },
      {
        id: "repeat",
        name: "Repeat buyer check",
        description:
          "Learn what brought a returning customer back for another order.",
        category: "attribution",
        questionCount: 2,
        estimatedSeconds: 20,
        surface: "Order status",
        audience: "Returning buyers",
        icon: "order-repeat",
        questions: [
          "What brought you back?",
          "What would make you order from us again?",
        ],
      },
      {
        id: "gift",
        name: "Gift buyer",
        description:
          "See whether the order was a gift and who recommended the product.",
        category: "attribution",
        questionCount: 2,
        estimatedSeconds: 20,
        surface: "Thank you",
        audience: "Gift buyers",
        icon: "gift-card",
        questions: [
          "Is this order a gift?",
          "Who recommended this product or store?",
        ],
      },
      {
        id: "sms",
        name: "Email and SMS source",
        description:
          "Confirm whether a message, flow, or text led to the purchase.",
        category: "attribution",
        questionCount: 2,
        estimatedSeconds: 15,
        surface: "Thank you",
        audience: "New buyers",
        badge: "new",
        icon: "email",
        questions: [
          "Did an email or text message lead you to this order?",
          "Which message was it?",
        ],
      },
      {
        id: "product",
        name: "Post-purchase product feedback",
        description:
          "Ask if the product met expectations once the order is in hand.",
        category: "feedback",
        questionCount: 3,
        estimatedSeconds: 40,
        surface: "Order status",
        audience: "Delivered orders",
        badge: "recommended",
        icon: "product",
        questions: [
          "Does the product match what you expected?",
          "What could we improve?",
          "Would you buy this again?",
        ],
      },
      {
        id: "delivery",
        name: "Shipping and delivery",
        description:
          "Measure how the unboxing and delivery felt after the order arrived.",
        category: "experience",
        questionCount: 3,
        estimatedSeconds: 30,
        surface: "Order status",
        audience: "Delivered orders",
        icon: "delivery",
        questions: [
          "How was the shipping speed?",
          "Did the package arrive in good condition?",
          "Anything we should change about delivery?",
        ],
      },
      {
        id: "nps",
        name: "Post-purchase NPS",
        description:
          "Score loyalty right after checkout, then ask what drove the rating.",
        category: "feedback",
        questionCount: 2,
        estimatedSeconds: 20,
        surface: "Thank you",
        audience: "All buyers",
        icon: "smiley-happy",
        questions: [
          "How likely are you to recommend us to a friend?",
          "What is the main reason for your score?",
        ],
      },
      {
        id: "wholesale",
        name: "Wholesale source",
        description:
          "Ask B2B buyers how their team found you before the next order.",
        category: "attribution",
        questionCount: 2,
        estimatedSeconds: 25,
        surface: "Thank you",
        audience: "Wholesale buyers",
        icon: "organization",
        questions: [
          "How did your team find us?",
          "Who else should we speak with at your company?",
        ],
      },
    ],
  };
};

function badgeLabel(badge: TemplateBadge): string {
  if (badge === "most_popular") {
    return "Most popular";
  }
  if (badge === "recommended") {
    return "Recommended";
  }
  return "New";
}

function badgeTone(badge: TemplateBadge): "success" | "info" | "caution" {
  if (badge === "most_popular") {
    return "success";
  }
  if (badge === "recommended") {
    return "info";
  }
  return "caution";
}

function durationLabel(seconds: number): string {
  if (seconds >= 60) {
    return `${Math.round(seconds / 60)} min setup`;
  }
  return `${seconds} sec`;
}

function TemplateCard({
  template,
  onUse,
}: {
  template: SurveyTemplate;
  onUse: (template: SurveyTemplate) => void;
}) {
  const previewId = `preview-${template.id}`;

  return (
    <s-box
      border="base"
      borderRadius="base"
      overflow="hidden"
      background="base"
    >
      <s-box background="subdued" padding="large">
        <s-stack alignItems="center" gap="small-200">
          <s-icon type={template.icon} size="base" />
          {template.badge ? (
            <s-badge tone={badgeTone(template.badge)}>
              {badgeLabel(template.badge)}
            </s-badge>
          ) : null}
        </s-stack>
      </s-box>
      <s-box padding="base">
        <s-stack gap="small-300">
          <s-heading>{template.name}</s-heading>
          <s-paragraph color="subdued">{template.description}</s-paragraph>
          <s-stack direction="inline" gap="small-200">
            <s-badge icon="question-circle">
              {template.questionCount === 0
                ? "Your questions"
                : `${template.questionCount} questions`}
            </s-badge>
            <s-badge icon="clock">
              {durationLabel(template.estimatedSeconds)}
            </s-badge>
          </s-stack>
          <s-text color="subdued">
            {template.surface} · {template.audience}
          </s-text>
          <s-button-group>
            <s-button
              slot="primary-action"
              variant="primary"
              icon="plus"
              onClick={() => onUse(template)}
            >
              Use template
            </s-button>
            {template.questions.length > 0 ? (
              <s-button
                slot="secondary-actions"
                icon="view"
                commandFor={previewId}
                command="--show"
              >
                Preview
              </s-button>
            ) : null}
          </s-button-group>
        </s-stack>
      </s-box>
    </s-box>
  );
}

/**
 * Template picker. Merchants pick a post-purchase starting point here;
 * the survey editor is the next step after a template is chosen.
 */
export default function SurveyTemplatesPage() {
  const { templates } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryView>("all");

  const featured = templates.find((template) => template.id === "hdyhau");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory =
        category === "all" || template.category === category;
      const matchesQuery =
        normalized.length === 0 ||
        template.name.toLowerCase().includes(normalized) ||
        template.description.toLowerCase().includes(normalized) ||
        template.audience.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, templates]);

  const useTemplate = (template: SurveyTemplate) => {
    openSurveyEditor({
      templateId: template.id === "blank" ? undefined : template.id,
    });
  };

  return (
    <s-page heading="Select a template">
      <s-link slot="breadcrumb-actions" href="/app/surveys">
        Surveys
      </s-link>
      <s-button
        slot="primary-action"
        variant="primary"
        icon="plus"
        onClick={() => {
          const blank = templates.find((template) => template.id === "blank");
          if (blank) {
            useTemplate(blank);
          }
        }}
      >
        Start from scratch
      </s-button>

      {featured ? (
        <s-section heading={featured.name} subheading={featured.description}>
          <s-query-container>
            <s-grid
              gridTemplateColumns="@container (inline-size <= 640px) 1fr, 1fr auto"
              gap="base"
              alignItems="center"
            >
              <s-stack gap="small-200">
                <s-stack direction="inline" gap="small-200">
                  <s-badge tone="success">Most popular</s-badge>
                  <s-badge tone="info">{featured.surface}</s-badge>
                  <s-badge icon="question-circle">
                    {featured.questionCount} questions
                  </s-badge>
                  <s-badge icon="clock">
                    {durationLabel(featured.estimatedSeconds)}
                  </s-badge>
                  <s-badge icon="person">{featured.audience}</s-badge>
                </s-stack>
                <s-paragraph>
                  Instagram, TikTok, Google, a friend, email, or Other. Optional
                  follow-up captures the channel your list missed.
                </s-paragraph>
                <s-button-group>
                  <s-button
                    variant="primary"
                    icon="plus"
                    onClick={() => useTemplate(featured)}
                  >
                    Use this template
                  </s-button>
                  <s-button
                    icon="view"
                    commandFor="preview-hdyhau"
                    command="--show"
                  >
                    Preview questions
                  </s-button>
                </s-button-group>
              </s-stack>
              <s-box
                maxInlineSize="220px"
                borderRadius="base"
                overflow="hidden"
                background="subdued"
              >
                <s-image
                  src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                  alt="Illustration for the how did you hear about us survey"
                  aspectRatio="1/0.5"
                />
              </s-box>
            </s-grid>
          </s-query-container>
        </s-section>
      ) : null}

      <s-section
        heading="All templates"
        subheading="Filter by job: attribution, delivery experience, or product feedback."
      >
        <s-query-container>
          <s-grid
            gridTemplateColumns="@container (inline-size <= 640px) 1fr, 1fr auto"
            gap="base"
            alignItems="end"
          >
            <s-search-field
              label="Search templates"
              labelAccessibilityVisibility="exclusive"
              placeholder="Search templates"
              value={query}
              onInput={(event) => {
                setQuery(event.currentTarget.value);
              }}
            />
            <s-stack direction="inline" gap="small-200">
              {CATEGORIES.map((item) => (
                <s-button
                  key={item.id}
                  variant={category === item.id ? "primary" : "secondary"}
                  onClick={() => setCategory(item.id)}
                >
                  {item.label}
                </s-button>
              ))}
            </s-stack>
          </s-grid>
        </s-query-container>
      </s-section>

      {visible.length === 0 ? (
        <s-section accessibilityLabel="No matching templates">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-stack alignItems="center">
              <s-heading>No templates match this view</s-heading>
              <s-paragraph>
                Clear search or choose All to see every post-purchase starting
                point.
              </s-paragraph>
            </s-stack>
            <s-button
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Show all templates
            </s-button>
          </s-grid>
        </s-section>
      ) : (
        <s-query-container>
          <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(260px, 1fr))"
            gap="base"
          >
            {visible.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={useTemplate}
              />
            ))}
          </s-grid>
        </s-query-container>
      )}

      {templates
        .filter((template) => template.questions.length > 0)
        .map((template) => (
          <s-modal
            key={`preview-${template.id}`}
            id={`preview-${template.id}`}
            heading={template.name}
            size="large"
          >
            <s-stack gap="base">
              <s-paragraph>{template.description}</s-paragraph>
              <s-stack direction="inline" gap="small-200">
                <s-badge icon="question-circle">
                  {template.questionCount} questions
                </s-badge>
                <s-badge icon="clock">
                  {durationLabel(template.estimatedSeconds)}
                </s-badge>
                <s-badge tone="info">{template.surface}</s-badge>
              </s-stack>
              <s-section heading="Questions customers will see">
                <s-ordered-list>
                  {template.questions.map((question) => (
                    <s-list-item key={question}>{question}</s-list-item>
                  ))}
                </s-ordered-list>
              </s-section>
            </s-stack>
            <s-button
              slot="secondary-actions"
              commandFor={`preview-${template.id}`}
              command="--hide"
            >
              Close
            </s-button>
            <s-button
              slot="primary-action"
              variant="primary"
              icon="plus"
              commandFor={`preview-${template.id}`}
              command="--hide"
              onClick={() => useTemplate(template)}
            >
              Use this template
            </s-button>
          </s-modal>
        ))}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
