import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useRevalidator } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  ActionList,
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  ChoiceList,
  EmptyState,
  IndexTable,
  InlineStack,
  Layout,
  Page,
  Pagination,
  Popover,
  Text,
  TextField,
  useIndexResourceState,
} from "@shopify/polaris";
import { FilterIcon } from "@shopify/polaris-icons";
import { useOpenEditor } from "../lib/editor-modal";
import { CHANNEL_LABELS } from "../lib/survey/channels";
import { enabledChannelLabels } from "../lib/survey/runtime-channels";
import type { SurveyDocument } from "../lib/survey/types";
import {
  createSurveyViaApi,
  deleteSurveyViaApi,
  surveyMutationViaApi,
} from "../lib/survey/survey-admin-api.client";
import {
  listSurveyRowsForShop,
  responseCountsForSurveys,
  type SurveyStatus,
} from "../lib/survey/survey-store.server";
import { shopFromAdminSession } from "../lib/shop/shop.server";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

type StatusView = "all" | SurveyStatus;

interface SurveyRow {
  id: string;
  name: string;
  question: string;
  status: SurveyStatus;
  channelsLabel: string;
  responses: number;
  createdAt: string;
}

const PAGE_SIZE = 4;

function formatSurveyDate(iso: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(iso);
}

function questionFromDocument(document: SurveyDocument): string {
  return document.questions?.[0]?.heading?.trim() || "—";
}

/**
 * Surveys index loader — shop-scoped rows from Prisma.
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<{ surveys: SurveyRow[] }> => {
  const { session } = await authenticate.admin(request);
  const shop = await shopFromAdminSession(session);
  const rows = await listSurveyRowsForShop(shop);
  const counts = await responseCountsForSurveys(
    shop,
    rows.map((row) => row.surveyUuid),
  );

  const surveys: SurveyRow[] = rows.map((row) => {
    const document = row.document as unknown as SurveyDocument;
    return {
      id: row.surveyUuid,
      name: row.name,
      question: questionFromDocument(document),
      status: row.status as SurveyStatus,
      channelsLabel:
        enabledChannelLabels(document, CHANNEL_LABELS).join(", ") || "—",
      responses: counts.get(row.surveyUuid) ?? 0,
      createdAt: formatSurveyDate(row.createdAt),
    };
  });

  return { surveys };
};

function statusTone(status: SurveyStatus): "success" | "warning" {
  return status === "live" ? "success" : "warning";
}

/**
 * Survey index. Local state covers filter, search, paging, and row actions
 * until the survey editor and database writes exist.
 */
export default function SurveysPage() {
  const data = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const shopifyRef = useRef(shopify);
  shopifyRef.current = shopify;
  const openEditor = useOpenEditor();
  const revalidator = useRevalidator();
  const [mutationPending, setMutationPending] = useState(false);
  const surveys = data.surveys;
  const [query, setQuery] = useState("");
  const [statusView, setStatusView] = useState<StatusView[]>(["all"]);
  const [page, setPage] = useState(0);
  const [showPlacementTip, setShowPlacementTip] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Per-row action popover state: surveyId → open
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const createThenOpenEditor = useRef(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const status = statusView[0] ?? "all";
    return surveys.filter((survey) => {
      const matchesStatus = status === "all" || survey.status === status;
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

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(visible as unknown as { [key: string]: unknown }[]);

  const toggleMenu = useCallback(
    (id: string) => setOpenMenuId((current) => (current === id ? null : id)),
    [],
  );

  async function runListMutation(
    run: (token: string) => Promise<{ ok: boolean; error?: string; surveyId?: string }>,
    options?: { openEditorOnCreate?: boolean },
  ): Promise<void> {
    setMutationPending(true);
    try {
      const token = await shopifyRef.current.idToken();
      const result = await run(token);
      if (result.ok) {
        if (options?.openEditorOnCreate && result.surveyId) {
          createThenOpenEditor.current = false;
          openEditor({ surveyId: result.surveyId });
        } else {
          shopifyRef.current.toast.show("Survey updated");
          setOpenMenuId(null);
        }
        revalidator.revalidate();
        return;
      }
      shopifyRef.current.toast.show(
        result.error ?? "Action failed",
        { isError: true },
      );
    } catch (error) {
      console.error("survey list mutation", error);
      shopifyRef.current.toast.show("Action failed", { isError: true });
    } finally {
      setMutationPending(false);
    }
  }

  function createSurveyAndOpenEditor() {
    createThenOpenEditor.current = true;
    void runListMutation((token) => createSurveyViaApi(token), {
      openEditorOnCreate: true,
    });
  }

  const duplicateSurvey = (survey: SurveyRow) => {
    void runListMutation((token) =>
      surveyMutationViaApi(survey.id, "duplicate", token),
    );
    setPage(0);
  };

  const toggleStatus = (survey: SurveyRow) => {
    void runListMutation((token) =>
      surveyMutationViaApi(survey.id, "toggle-status", token),
    );
  };

  const deleteSurvey = (survey: SurveyRow) => {
    void runListMutation((token) => deleteSurveyViaApi(survey.id, token));
  };

  const rowMarkup = visible.map((survey, index) => (
    <IndexTable.Row
      id={survey.id}
      key={survey.id}
      selected={selectedResources.includes(survey.id)}
      position={index}
    >
      <IndexTable.Cell>
        <BlockStack gap="100">
          <button
            type="button"
            onClick={() => openEditor({ surveyId: survey.id })}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "var(--p-color-text-emphasis)",
              fontWeight: 600,
              textAlign: "left",
            }}
          >
            {survey.name}
          </button>
          <Text as="p" tone="subdued">
            {survey.question}
          </Text>
        </BlockStack>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={statusTone(survey.status)}>
          {survey.status === "live" ? "Live" : "Paused"}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>{survey.createdAt}</IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodySm">
          {survey.channelsLabel}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Link to="/app/responses">{survey.responses}</Link>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Popover
          active={openMenuId === survey.id}
          activator={
            <Button
              variant="tertiary"
              accessibilityLabel={`Actions for ${survey.name}`}
              icon={
                <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
                  <circle cx="4" cy="10" r="2" />
                  <circle cx="10" cy="10" r="2" />
                  <circle cx="16" cy="10" r="2" />
                </svg>
              }
              onClick={() => toggleMenu(survey.id)}
            />
          }
          onClose={() => setOpenMenuId(null)}
        >
          <ActionList
            items={[
              {
                content: "Edit",
                onAction: () => {
                  openEditor({ surveyId: survey.id });
                  setOpenMenuId(null);
                },
              },
              {
                content: "Duplicate",
                onAction: () => duplicateSurvey(survey),
              },
              {
                content: survey.status === "live" ? "Pause" : "Set live",
                onAction: () => toggleStatus(survey),
              },
              {
                content: "Delete",
                destructive: true,
                onAction: () => deleteSurvey(survey),
              },
            ]}
          />
        </Popover>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Surveys"
      secondaryActions={[
        {
          content: "Choose a template",
          url: "/app/surveys/templates",
        },
      ]}
      primaryAction={
        <Button
          variant="primary"
          icon={
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
              <path d="M11 9h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 1 1 2 0v4Z" />
            </svg>
          }
          onClick={createSurveyAndOpenEditor}
          loading={mutationPending}
        >
          Create survey
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card padding="0">
              {surveys.length === 0 ? (
                <EmptyState
                  heading="Create your first survey"
                  image="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                  action={{
                    content: "Create survey",
                    onAction: createSurveyAndOpenEditor,
                  }}
                  secondaryAction={{
                    content: "Choose a template",
                    url: "/app/surveys/templates",
                  }}
                >
                  <Text as="p">
                    Ask customers how they found you on the Thank You page, then
                    read the answers under Responses.
                  </Text>
                </EmptyState>
              ) : (
                <>
                  <Box padding="300">
                    <InlineStack gap="200" align="space-between" blockAlign="center">
                      <Box minWidth="280px">
                        <TextField
                          label="Search surveys"
                          labelHidden
                          placeholder="Search surveys"
                          value={query}
                          onChange={(val) => {
                            setQuery(val);
                            setPage(0);
                          }}
                          clearButton
                          onClearButtonClick={() => {
                            setQuery("");
                            setPage(0);
                          }}
                          autoComplete="off"
                        />
                      </Box>
                      <Popover
                        active={filterOpen}
                        activator={
                          <Button
                            icon={FilterIcon}
                            variant="secondary"
                            onClick={() => setFilterOpen((v) => !v)}
                            accessibilityLabel="Filter surveys"
                          />
                        }
                        onClose={() => setFilterOpen(false)}
                      >
                        <Box padding="300" minWidth="180px">
                          <ChoiceList
                            title="Status"
                            choices={[
                              { label: "All", value: "all" },
                              { label: "Live", value: "live" },
                              { label: "Paused", value: "paused" },
                            ]}
                            selected={statusView}
                            onChange={(val) => {
                              setStatusView(val as StatusView[]);
                              setPage(0);
                              setFilterOpen(false);
                            }}
                          />
                        </Box>
                      </Popover>
                    </InlineStack>
                  </Box>
                  <IndexTable
                    resourceName={{ singular: "survey", plural: "surveys" }}
                    itemCount={visible.length}
                    selectedItemsCount={
                      allResourcesSelected ? "All" : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                      { title: "Survey" },
                      { title: "Status" },
                      { title: "Created" },
                      { title: "Channels" },
                      { title: "Responses" },
                      { title: "Actions", hidden: true },
                    ]}
                    emptyState={
                      <Box padding="400">
                        <Text as="p" tone="subdued" alignment="center">
                          No surveys match this view.
                        </Text>
                      </Box>
                    }
                  >
                    {rowMarkup}
                  </IndexTable>
                  {pageCount > 1 ? (
                    <Box padding="300">
                      <InlineStack align="center">
                        <Pagination
                          hasPrevious={currentPage > 0}
                          hasNext={currentPage < pageCount - 1}
                          onPrevious={() => setPage(currentPage - 1)}
                          onNext={() => setPage(currentPage + 1)}
                        />
                      </InlineStack>
                    </Box>
                  ) : null}
                </>
              )}
            </Card>

            {showPlacementTip && surveys.length > 0 ? (
              <Card>
                <InlineStack align="space-between" blockAlign="start">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      Show this survey after checkout
                    </Text>
                    <Text as="p" tone="subdued">
                      Add the block to the Thank You page. Only live surveys
                      are offered to customers.
                    </Text>
                    <Box>
                      <Button url="/app/settings">Review placement</Button>
                    </Box>
                  </BlockStack>
                  <Button
                    variant="plain"
                    accessibilityLabel="Dismiss placement tip"
                    onClick={() => {
                      setShowPlacementTip(false);
                      shopify.toast.show("Tip dismissed");
                    }}
                  >
                    ✕
                  </Button>
                </InlineStack>
              </Card>
            ) : null}

            <Text as="p" tone="subdued" alignment="center">
              Learn more about{" "}
              <a
                href="https://shopify.dev/docs/api/checkout-ui-extensions/latest/targets/purchase-thank-you"
                target="_blank"
                rel="noreferrer"
              >
                Thank You page blocks
              </a>
              .
            </Text>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
