import { useMemo, useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { openSurveyEditor } from "../lib/open-survey-editor";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

type SurveyStatus = "live" | "paused";
type StatusView = "all" | SurveyStatus;

interface SurveyRow {
  id: string;
  name: string;
  question: string;
  status: SurveyStatus;
  /** Checkout surface where this survey is offered. */
  surface: "Thank you" | "Order status";
  responses: number;
  createdAt: string;
}

const PAGE_SIZE = 4;

/**
 * Surveys index loader.
 * Mock rows stand in for persistence so merchants can filter, page, and try row actions.
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<{ surveys: SurveyRow[] }> => {
  await authenticate.admin(request);

  return {
    surveys: [
      {
        id: "surv_hdyhau",
        name: "Post-purchase attribution",
        question: "How did you hear about us?",
        status: "live",
        surface: "Thank you",
        responses: 248,
        createdAt: "Aug 23, 2026",
      },
      {
        id: "surv_repeat",
        name: "Repeat buyer check",
        question: "What brought you back?",
        status: "live",
        surface: "Order status",
        responses: 86,
        createdAt: "Sep 2, 2026",
      },
      {
        id: "surv_wholesale",
        name: "Wholesale source",
        question: "How did your team find us?",
        status: "paused",
        surface: "Thank you",
        responses: 12,
        createdAt: "Jul 14, 2026",
      },
      {
        id: "surv_holiday",
        name: "Holiday campaign",
        question: "Which campaign sent you here?",
        status: "live",
        surface: "Thank you",
        responses: 40,
        createdAt: "Nov 18, 2025",
      },
      {
        id: "surv_sms",
        name: "SMS follow-up",
        question: "Did a text message lead you to order?",
        status: "paused",
        surface: "Order status",
        responses: 0,
        createdAt: "Jun 9, 2026",
      },
      {
        id: "surv_gift",
        name: "Gift buyer",
        question: "Who recommended this gift?",
        status: "live",
        surface: "Thank you",
        responses: 19,
        createdAt: "May 1, 2026",
      },
    ],
  };
};

function statusLabel(status: SurveyStatus): string {
  return status === "live" ? "Live" : "Paused";
}

/**
 * Survey index. Local state covers filter, search, paging, and row actions
 * until the survey editor and database writes exist.
 */
export default function SurveysPage() {
  const data = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const [surveys, setSurveys] = useState<SurveyRow[]>(data.surveys);
  const [query, setQuery] = useState("");
  const [statusView, setStatusView] = useState<StatusView>("all");
  const [page, setPage] = useState(0);
  const [showPlacementTip, setShowPlacementTip] = useState(true);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return surveys.filter((survey) => {
      const matchesStatus =
        statusView === "all" || survey.status === statusView;
      const matchesQuery =
        normalized.length === 0 ||
        survey.name.toLowerCase().includes(normalized) ||
        survey.question.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [query, statusView, surveys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  const openEditor = (surveyId: string) => {
    openSurveyEditor({ surveyId });
  };

  const setView = (view: StatusView) => {
    setStatusView(view);
    setPage(0);
  };

  return (
    <s-page inlineSize="large">
      <s-section
        padding="none"
        accessibilityLabel="Survey list"
        heading="Survey list"
        subheading="Questions customers answer after checkout."
      >
        <s-button slot="secondary-actions" href="/app/surveys/templates">
          Choose a template
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          icon="plus"
          onClick={() => openSurveyEditor()}
        >
          Create survey
        </s-button>

        {surveys.length === 0 ? (
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-box maxInlineSize="200px" maxBlockSize="200px">
              <s-image
                aspectRatio="1/0.5"
                src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                alt="Illustration of a survey ready to be created"
              />
            </s-box>
            <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
              <s-stack alignItems="center">
                <s-heading>Create your first survey</s-heading>
                <s-paragraph>
                  Ask customers how they found you on the Thank You page, then
                  read the answers under Responses.
                </s-paragraph>
              </s-stack>
              <s-stack direction="inline" gap="small-200">
                <s-button
                  variant="primary"
                  icon="plus"
                  onClick={() => openSurveyEditor()}
                >
                  Create survey
                </s-button>
                <s-button href="/app/surveys/templates">
                  Choose a template
                </s-button>
              </s-stack>
            </s-grid>
          </s-grid>
        ) : (
          <s-table
            paginate
            hasPreviousPage={currentPage > 0}
            hasNextPage={currentPage < pageCount - 1}
            onPreviousPage={() => setPage(currentPage - 1)}
            onNextPage={() => setPage(currentPage + 1)}
          >
            <s-grid
              slot="filters"
              gap="small-200"
              gridTemplateColumns="1fr auto"
            >
              <s-text-field
                label="Search surveys"
                labelAccessibilityVisibility="exclusive"
                icon="search"
                placeholder="Search surveys"
                value={query}
                onInput={(event) => {
                  setQuery(event.currentTarget.value);
                  setPage(0);
                }}
              />
              <s-button
                icon="filter"
                variant="secondary"
                accessibilityLabel="Filter surveys"
                interestFor="survey-filter-tooltip"
                commandFor="survey-filter"
              />
              <s-tooltip id="survey-filter-tooltip">
                <s-text>Filter</s-text>
              </s-tooltip>
              <s-popover id="survey-filter">
                <s-box padding="small">
                  <s-choice-list
                    label="Status"
                    name="survey-status"
                    values={[statusView]}
                    onChange={(event) => {
                      const next = event.currentTarget.values?.[0];
                      if (
                        next === "all" ||
                        next === "live" ||
                        next === "paused"
                      ) {
                        setView(next);
                      }
                    }}
                  >
                    <s-choice value="all">All</s-choice>
                    <s-choice value="live">Live</s-choice>
                    <s-choice value="paused">Paused</s-choice>
                  </s-choice-list>
                </s-box>
              </s-popover>
            </s-grid>

            <s-table-header-row>
              <s-table-header listSlot="primary">Survey</s-table-header>
              <s-table-header listSlot="inline">Status</s-table-header>
              <s-table-header listSlot="labeled">Created</s-table-header>
              <s-table-header>Shown on</s-table-header>
              <s-table-header format="numeric" listSlot="labeled">
                Responses
              </s-table-header>
              <s-table-header listSlot="secondary">
                <s-text color="subdued">Actions</s-text>
              </s-table-header>
            </s-table-header-row>

            <s-table-body>
              {visible.length === 0 ? (
                <s-table-row>
                  <s-table-cell>
                    <s-text>No surveys match this view.</s-text>
                  </s-table-cell>
                  <s-table-cell />
                  <s-table-cell />
                  <s-table-cell />
                  <s-table-cell />
                  <s-table-cell />
                </s-table-row>
              ) : (
                visible.map((survey) => {
                  const menuId = `survey-menu-${survey.id}`;
                  return (
                    <s-table-row key={survey.id}>
                      <s-table-cell>
                        <s-stack direction="block" gap="small-200">
                          <s-link
                            onClick={(event) => {
                              event.preventDefault();
                              openEditor(survey.id);
                            }}
                            href={`/app/surveys?survey=${survey.id}`}
                          >
                            {survey.name}
                          </s-link>
                          <s-text color="subdued">{survey.question}</s-text>
                        </s-stack>
                      </s-table-cell>
                      <s-table-cell>
                        <s-badge
                          tone={
                            survey.status === "live" ? "success" : "warning"
                          }
                        >
                          {statusLabel(survey.status)}
                        </s-badge>
                      </s-table-cell>
                      <s-table-cell>{survey.createdAt}</s-table-cell>
                      <s-table-cell>
                        <s-badge tone="info">{survey.surface}</s-badge>
                      </s-table-cell>
                      <s-table-cell>
                        <s-link href="/app/responses">
                          {survey.responses}
                        </s-link>
                      </s-table-cell>
                      <s-table-cell>
                        <s-button
                          icon="menu-horizontal"
                          variant="tertiary"
                          accessibilityLabel={`Actions for ${survey.name}`}
                          commandFor={menuId}
                        />
                        <s-menu
                          id={menuId}
                          accessibilityLabel={`${survey.name} actions`}
                        >
                          <s-button
                            icon="edit"
                            onClick={() => openEditor(survey.id)}
                          >
                            Edit
                          </s-button>
                          <s-button
                            icon="duplicate"
                            onClick={() => {
                              setSurveys((current) => [
                                {
                                  ...survey,
                                  id: `${survey.id}-copy-${Date.now()}`,
                                  name: `${survey.name} copy`,
                                  status: "paused",
                                  responses: 0,
                                  createdAt: "Today",
                                },
                                ...current,
                              ]);
                              setPage(0);
                              shopify.toast.show("Survey duplicated");
                            }}
                          >
                            Duplicate
                          </s-button>
                          <s-button
                            icon={
                              survey.status === "live" ? "disabled" : "enabled"
                            }
                            onClick={() => {
                              setSurveys((current) =>
                                current.map((row) =>
                                  row.id === survey.id
                                    ? {
                                        ...row,
                                        status:
                                          row.status === "live"
                                            ? "paused"
                                            : "live",
                                      }
                                    : row,
                                ),
                              );
                              shopify.toast.show(
                                survey.status === "live"
                                  ? "Survey paused"
                                  : "Survey is live",
                              );
                            }}
                          >
                            {survey.status === "live" ? "Pause" : "Set live"}
                          </s-button>
                          <s-button
                            icon="delete"
                            tone="critical"
                            onClick={() => {
                              setSurveys((current) =>
                                current.filter((row) => row.id !== survey.id),
                              );
                              shopify.toast.show("Survey removed");
                            }}
                          >
                            Delete
                          </s-button>
                        </s-menu>
                      </s-table-cell>
                    </s-table-row>
                  );
                })
              )}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      {showPlacementTip && surveys.length > 0 ? (
        <s-section>
          <s-grid
            gridTemplateColumns="1fr auto"
            gap="small-400"
            alignItems="start"
          >
            <s-grid
              gridTemplateColumns="@container (inline-size <= 480px) 1fr, auto auto"
              gap="base"
              alignItems="center"
            >
              <s-grid gap="small-200">
                <s-heading>Show this survey after checkout</s-heading>
                <s-paragraph>
                  Add the SnapPlux block to the Thank You page. Only live
                  surveys are offered to customers.
                </s-paragraph>
                <s-button href="/app/settings">Review placement</s-button>
              </s-grid>
              <s-box
                maxInlineSize="200px"
                borderRadius="base"
                overflow="hidden"
              >
                <s-image
                  src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                  alt="Illustration of a post-purchase survey block"
                  aspectRatio="1/0.5"
                />
              </s-box>
            </s-grid>
            <s-button
              icon="x"
              tone="neutral"
              variant="tertiary"
              accessibilityLabel="Dismiss placement tip"
              onClick={() => {
                setShowPlacementTip(false);
                shopify.toast.show("Tip dismissed");
              }}
            />
          </s-grid>
        </s-section>
      ) : null}

      <s-stack alignItems="center" paddingBlock="large">
        <s-text color="subdued">
          Learn more about{" "}
          <s-link
            href="https://shopify.dev/docs/api/checkout-ui-extensions/latest/targets/purchase-thank-you"
            target="_blank"
          >
            Thank You page blocks
          </s-link>
          .
        </s-text>
      </s-stack>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
