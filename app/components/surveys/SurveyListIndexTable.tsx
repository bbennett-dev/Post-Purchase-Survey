import {
  ActionList,
  Badge,
  BlockStack,
  Box,
  Button,
  IndexFilters,
  IndexFiltersMode,
  IndexTable,
  InlineGrid,
  InlineStack,
  Link,
  Pagination,
  Popover,
  Select,
  Text,
  Tooltip,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
import { MenuHorizontalIcon } from "@shopify/polaris-icons";
import { useCallback, useMemo, useState } from "react";
import { surveyEditorPath } from "../../lib/open-survey-editor";
import type { SurveyListItem } from "../../lib/survey/admin-api/survey-list.server";
import type { SurveyStatus } from "../../lib/survey/survey-store.server";
import styles from "./survey-list-index-table.module.css";

export type StatusView = "all" | SurveyStatus;

const STATUS_TABS = ["All", "Live", "Paused"] as const;

const ITEMS_PER_PAGE_OPTIONS = [
  { label: "10", value: "10" },
  { label: "25", value: "25" },
  { label: "50", value: "50" },
];

/** Right-aligned page size control; pairs with IndexTable `pagination` (centered). */
function SurveyListItemsPerPage({
  value,
  onChange,
}: {
  value: number;
  onChange: (size: number) => void;
}) {
  return (
    <InlineStack gap="200" blockAlign="center" wrap={false}>
      <Text as="span" variant="bodySm" tone="subdued">
        Items per page
      </Text>
      <Box minWidth="72px">
        <Select
          label="Items per page"
          labelHidden
          options={ITEMS_PER_PAGE_OPTIONS}
          value={String(value)}
          onChange={(next) => onChange(Number(next))}
        />
      </Box>
    </InlineStack>
  );
}

function statusViewFromTabIndex(index: number): StatusView {
  if (index === 1) return "live";
  if (index === 2) return "paused";
  return "all";
}

function tabIndexFromStatusView(view: StatusView): number {
  if (view === "live") return 1;
  if (view === "paused") return 2;
  return 0;
}

function surveyResponsesUrl(surveyId: string): string {
  return `/app/responses?survey=${encodeURIComponent(surveyId)}`;
}

const SURVEY_NAME_DISPLAY_MAX = 36;

function SurveyNameCell({
  name,
  surveyId,
}: {
  name: string;
  surveyId: string;
}) {
  const isLong = name.length > SURVEY_NAME_DISPLAY_MAX;
  const displayName = isLong
    ? `${name.slice(0, SURVEY_NAME_DISPLAY_MAX)}...`
    : name;

  const linkMarkup = (
    <div className={styles.surveyNameLink}>
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        <Link
          url={surveyEditorPath({ surveyId }, { maxModal: true })}
          dataPrimaryLink
          monochrome
        >
          {displayName}
        </Link>
      </Text>
    </div>
  );

  if (!isLong) {
    return linkMarkup;
  }

  return (
    <Tooltip content={name} width="wide">
      {linkMarkup}
    </Tooltip>
  );
}

function statusDotColor(status: SurveyStatus): string {
  return status === "live"
    ? "var(--p-color-bg-fill-success)"
    : "var(--p-color-bg-fill-tertiary-active)";
}

/** Competitor-style status pill with dropdown (Live / Paused). */
export function SurveyStatusSelect({
  status,
  disabled,
  onSelect,
}: {
  status: SurveyStatus;
  disabled: boolean;
  onSelect: (next: SurveyStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = status === "live" ? "Live" : "Paused";

  return (
    <Popover
      active={open}
      activator={
        <Button
          disclosure={open ? "up" : "down"}
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
          size="slim"
          icon={
            <span
              aria-hidden
              style={{
                display: "block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: statusDotColor(status),
                marginInlineEnd: "var(--p-space-150)",
              }}
            />
          }
        >
          {label}
        </Button>
      }
      onClose={() => setOpen(false)}
    >
      <ActionList
        items={[
          {
            content: "Live",
            active: status === "live",
            onAction: () => {
              onSelect("live");
              setOpen(false);
            },
          },
          {
            content: "Paused",
            active: status === "paused",
            onAction: () => {
              onSelect("paused");
              setOpen(false);
            },
          },
        ]}
      />
    </Popover>
  );
}

function ResponseCountBadge({
  count,
  surveyId,
}: {
  count: number;
  surveyId: string;
}) {
  return (
    <InlineStack align="start">
      <Link url={surveyResponsesUrl(surveyId)} removeUnderline>
        <Box
          background="bg-surface-info"
          borderRadius="200"
          paddingInline="300"
          paddingBlock="100"
          minWidth="32px"
        >
          <Text
            as="span"
            variant="bodySm"
            alignment="center"
            fontWeight="semibold"
          >
            {count}
          </Text>
        </Box>
      </Link>
    </InlineStack>
  );
}

export interface SurveyListIndexTableProps {
  surveys: SurveyListItem[];
  mutationPending: boolean;
  onEdit: (surveyId: string) => void;
  onDuplicate: (survey: SurveyListItem) => void;
  onDelete: (survey: SurveyListItem) => void;
  onStatusChange: (survey: SurveyListItem, next: SurveyStatus) => void;
}

/**
 * Polaris IndexFilters + IndexTable layout aligned with
 * https://storybook.polaris.shopify.dev/?path=/story/all-components-indextable--with-filtering
 */
export function SurveyListIndexTable({
  surveys,
  mutationPending,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
}: SurveyListIndexTableProps) {
  const { mode, setMode } = useSetIndexFiltersMode();
  const [query, setQuery] = useState("");
  const [statusView, setStatusView] = useState<StatusView>("all");
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortSelected, setSortSelected] = useState<string[]>(["created desc"]);

  const selectedTab = tabIndexFromStatusView(statusView);

  const tabs = useMemo(
    () =>
      STATUS_TABS.map((label, index) => ({
        content: label,
        index,
        id: `survey-status-${label.toLowerCase()}`,
        onAction: () => {
          setStatusView(statusViewFromTabIndex(index));
          setPage(0);
        },
        isLocked: true,
      })),
    [],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const rows = surveys.filter((survey) => {
      const matchesStatus =
        statusView === "all" || survey.status === statusView;
      const matchesQuery =
        normalized.length === 0 ||
        survey.name.toLowerCase().includes(normalized) ||
        survey.question.toLowerCase().includes(normalized) ||
        survey.channelsLabel.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });

    const sortKey = sortSelected[0] ?? "created desc";
    const copy = [...rows];
    copy.sort((a, b) => {
      switch (sortKey) {
        case "name asc":
          return a.name.localeCompare(b.name);
        case "name desc":
          return b.name.localeCompare(a.name);
        case "created asc":
          return a.createdAt.localeCompare(b.createdAt);
        case "created desc":
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return copy;
  }, [query, sortSelected, statusView, surveys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage,
  );

  const toggleMenu = useCallback(
    (id: string) => setOpenMenuId((current) => (current === id ? null : id)),
    [],
  );

  const rowMarkup = visible.map((survey, index) => (
    <IndexTable.Row
      id={survey.id}
      key={survey.id}
      position={index}
      onClick={() => onEdit(survey.id)}
    >
      <IndexTable.Cell>
        <SurveyNameCell name={survey.name} surveyId={survey.id} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div onClick={(event) => event.stopPropagation()} role="presentation">
          <SurveyStatusSelect
            status={survey.status}
            disabled={mutationPending}
            onSelect={(next) => onStatusChange(survey, next)}
          />
        </div>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodySm" tone="subdued">
          {survey.createdAt}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {survey.enabledChannels.length === 0 ? (
          <Text as="span" tone="subdued">
            —
          </Text>
        ) : (
          <BlockStack gap="100" inlineAlign="start">
            {survey.enabledChannels.map((channel) => (
              <Badge key={`${survey.id}-${channel.key}`}>{channel.label}</Badge>
            ))}
          </BlockStack>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div onClick={(event) => event.stopPropagation()} role="presentation">
          <ResponseCountBadge count={survey.responses} surveyId={survey.id} />
        </div>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div onClick={(event) => event.stopPropagation()} role="presentation">
          <Popover
            active={openMenuId === survey.id}
            activator={
              <Button
                variant="tertiary"
                accessibilityLabel={`Actions for ${survey.name}`}
                icon={MenuHorizontalIcon}
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
                    onEdit(survey.id);
                    setOpenMenuId(null);
                  },
                },
                {
                  content: "Duplicate",
                  onAction: () => {
                    onDuplicate(survey);
                    setOpenMenuId(null);
                  },
                },
                {
                  content: "Delete",
                  destructive: true,
                  onAction: () => {
                    onDelete(survey);
                    setOpenMenuId(null);
                  },
                },
              ]}
            />
          </Popover>
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <>
      <div className={styles.indexFiltersTabs}>
        <IndexFilters
          tabs={tabs}
          selected={selectedTab}
          onSelect={(index) => {
            setStatusView(statusViewFromTabIndex(index));
            setPage(0);
          }}
          canCreateNewView={false}
          queryValue={query}
          queryPlaceholder="Search survey"
          onQueryChange={(value) => {
            setQuery(value);
            setPage(0);
          }}
          onQueryClear={() => {
            setQuery("");
            setPage(0);
          }}
          cancelAction={{
            onAction: () => {
              setQuery("");
              setMode(IndexFiltersMode.Default);
            },
            disabled: false,
            loading: false,
          }}
          filters={[]}
          appliedFilters={[]}
          onClearAll={() => {
            setQuery("");
            setStatusView("all");
            setPage(0);
          }}
          hideFilters
          mode={mode}
          setMode={setMode}
          disableKeyboardShortcuts
          sortOptions={[
            { label: "Survey name", value: "name asc", directionLabel: "A–Z" },
            { label: "Survey name", value: "name desc", directionLabel: "Z–A" },
            {
              label: "Created",
              value: "created asc",
              directionLabel: "Oldest",
            },
            {
              label: "Created",
              value: "created desc",
              directionLabel: "Newest",
            },
          ]}
          sortSelected={sortSelected}
          onSort={setSortSelected}
        />
      </div>
      <IndexTable
        selectable={false}
        resourceName={{ singular: "survey", plural: "surveys" }}
        itemCount={filtered.length}
        headings={[
          { title: "Survey name" },
          { title: "Status" },
          { title: "Created" },
          { title: "Channel" },
          { title: "Responses" },
          { title: "Actions" },
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
      {filtered.length > 0 ? (
        <Box
          borderBlockStartWidth="025"
          borderColor="border"
          paddingBlock="400"
          paddingInline="400"
        >
          <InlineGrid columns="1fr auto 1fr" alignItems="center">
            <span aria-hidden />
            <Pagination
              label={`Page ${currentPage + 1}/${pageCount}`}
              hasPrevious={currentPage > 0}
              hasNext={currentPage < pageCount - 1}
              onPrevious={() => setPage(currentPage - 1)}
              onNext={() => setPage(currentPage + 1)}
            />
            <InlineStack align="end">
              <SurveyListItemsPerPage
                value={itemsPerPage}
                onChange={(size) => {
                  setItemsPerPage(size);
                  setPage(0);
                }}
              />
            </InlineStack>
          </InlineGrid>
        </Box>
      ) : null}
    </>
  );
}
