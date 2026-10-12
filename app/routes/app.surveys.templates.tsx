import { boundary } from "@shopify/shopify-app-react-router/server";
import { useMemo, useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  InlineGrid,
  InlineStack,
  Layout,
  List,
  Modal,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { useOpenEditor } from "../lib/editor-modal";
import { authenticate } from "../shopify.server";

type TemplateCategory = "attribution" | "experience" | "feedback";
type CategoryView = "all" | TemplateCategory;
type TemplateBadge = "most_popular" | "recommended" | "new";

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
        questions: [
          "How did your team find us?",
          "Who else should we speak with at your company?",
        ],
      },
    ],
  };
};

function badgeLabel(badge: TemplateBadge): string {
  if (badge === "most_popular") return "Most popular";
  if (badge === "recommended") return "Recommended";
  return "New";
}

function badgeTone(badge: TemplateBadge): "success" | "info" | "attention" {
  if (badge === "most_popular") return "success";
  if (badge === "recommended") return "info";
  return "attention";
}

function durationLabel(seconds: number): string {
  if (seconds >= 60) return `${Math.round(seconds / 60)} min setup`;
  return `${seconds} sec`;
}

function TemplateCard({
  template,
  onUse,
  onPreview,
}: {
  template: SurveyTemplate;
  onUse: (template: SurveyTemplate) => void;
  onPreview: (template: SurveyTemplate) => void;
}) {
  return (
    <Card padding="0">
      <Box
        background="bg-surface-secondary"
        padding="600"
        borderRadius="200"
      >
        <InlineStack align="center" gap="200">
          {template.badge ? (
            <Badge tone={badgeTone(template.badge)}>
              {badgeLabel(template.badge)}
            </Badge>
          ) : null}
        </InlineStack>
      </Box>
      <Box padding="400">
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd">
            {template.name}
          </Text>
          <Text as="p" tone="subdued">
            {template.description}
          </Text>
          <InlineStack gap="200">
            <Badge>{template.questionCount === 0 ? "Your questions" : `${template.questionCount} questions`}</Badge>
            <Badge>{durationLabel(template.estimatedSeconds)}</Badge>
          </InlineStack>
          <Text as="p" tone="subdued">
            {template.surface} · {template.audience}
          </Text>
          <InlineStack gap="200">
            <Button variant="primary" onClick={() => onUse(template)}>
              Use template
            </Button>
            {template.questions.length > 0 ? (
              <Button onClick={() => onPreview(template)}>Preview</Button>
            ) : null}
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}

/**
 * Template picker. Merchants pick a post-purchase starting point here;
 * the survey editor is the next step after a template is chosen.
 */
export default function SurveyTemplatesPage() {
  const { templates } = useLoaderData<typeof loader>();
  const openEditor = useOpenEditor();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryView>("all");
  const [previewTemplate, setPreviewTemplate] = useState<SurveyTemplate | null>(null);

  const featured = templates.find((t) => t.id === "hdyhau");

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

  const applyTemplate = (template: SurveyTemplate) => {
    openEditor({
      templateId: template.id === "blank" ? undefined : template.id,
    });
  };

  return (
    <Page
      title="Select a template"
      backAction={{ content: "Surveys", url: "/app/surveys" }}
      primaryAction={
        <Button
          variant="primary"
          onClick={() => {
            const blank = templates.find((t) => t.id === "blank");
            if (blank) applyTemplate(blank);
          }}
        >
          Start from scratch
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {featured ? (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    {featured.name}
                  </Text>
                  <Text as="p" tone="subdued">
                    {featured.description}
                  </Text>
                  <InlineStack gap="200">
                    <Badge tone="success">Most popular</Badge>
                    <Badge tone="info">{featured.surface}</Badge>
                    <Badge>{`${featured.questionCount} questions`}</Badge>
                    <Badge>{durationLabel(featured.estimatedSeconds)}</Badge>
                    <Badge>{featured.audience}</Badge>
                  </InlineStack>
                  <Text as="p" tone="subdued">
                    Instagram, TikTok, Google, a friend, email, or Other.
                    Optional follow-up captures the channel your list missed.
                  </Text>
                  <InlineStack gap="200">
                    <Button
                      variant="primary"
                      onClick={() => applyTemplate(featured)}
                    >
                      Use this template
                    </Button>
                    <Button onClick={() => setPreviewTemplate(featured)}>
                      Preview questions
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            ) : null}

            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                All templates
              </Text>
              <InlineStack gap="200" align="space-between" blockAlign="center">
                <Box minWidth="280px">
                  <TextField
                    label="Search templates"
                    labelHidden
                    placeholder="Search templates"
                    value={query}
                    onChange={setQuery}
                    clearButton
                    onClearButtonClick={() => setQuery("")}
                    autoComplete="off"
                  />
                </Box>
                <InlineStack gap="100">
                  {CATEGORIES.map((item) => (
                    <Button
                      key={item.id}
                      variant={category === item.id ? "primary" : "secondary"}
                      onClick={() => setCategory(item.id)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </InlineStack>
              </InlineStack>

              {visible.length === 0 ? (
                <EmptyState
                  heading="No templates match this view"
                  image="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                  action={{
                    content: "Show all templates",
                    onAction: () => {
                      setQuery("");
                      setCategory("all");
                    },
                  }}
                >
                  <Text as="p">
                    Clear the search or choose All to see every post-purchase
                    starting point.
                  </Text>
                </EmptyState>
              ) : (
                <InlineGrid
                  columns={{ xs: 1, sm: 2, lg: 3 }}
                  gap="400"
                >
                  {visible.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onUse={applyTemplate}
                      onPreview={setPreviewTemplate}
                    />
                  ))}
                </InlineGrid>
              )}
            </BlockStack>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {previewTemplate ? (
        <Modal
          open
          onClose={() => setPreviewTemplate(null)}
          title={previewTemplate.name}
          primaryAction={{
            content: "Use this template",
            onAction: () => {
              applyTemplate(previewTemplate);
              setPreviewTemplate(null);
            },
          }}
          secondaryActions={[
            { content: "Close", onAction: () => setPreviewTemplate(null) },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text as="p" tone="subdued">
                {previewTemplate.description}
              </Text>
              <InlineStack gap="200">
                <Badge>{`${previewTemplate.questionCount} questions`}</Badge>
                <Badge>{durationLabel(previewTemplate.estimatedSeconds)}</Badge>
                <Badge tone="info">{previewTemplate.surface}</Badge>
              </InlineStack>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Questions customers will see
                </Text>
                <List type="number">
                  {previewTemplate.questions.map((q) => (
                    <List.Item key={q}>{q}</List.Item>
                  ))}
                </List>
              </BlockStack>
            </BlockStack>
          </Modal.Section>
        </Modal>
      ) : null}
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
