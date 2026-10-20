import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  IndexFilters,
  IndexFiltersMode,
  EmptySearchResult,
  IndexTable,
  InlineGrid,
  InlineStack,
  Link,
  Pagination,
  Select,
  Text,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
import { ArchiveIcon, ViewIcon } from "@shopify/polaris-icons";
import type { ResponseListApiItem } from "../../lib/survey/response/response-list-api.server";
import type { SurveyResponseQuestionDto } from "../../lib/survey/response/survey-response.types";
import {
  answerSearchText,
  answerTypeLabel,
  formatResponseDisplayId,
  formatResponseSubmittedAt,
} from "../../lib/survey/response/response-list-formatters";
import { useClientFormattedDate } from "../../lib/routes/use-client-formatted-date";
import { ResponseAnswerCell } from "./ResponseAnswerCell";
import type { ResponseView } from "../../lib/routes/responses-route";
import styles from "./response-list-index-table.module.css";

export type { ResponseView };

const VIEW_TABS = ["Active", "Archived"] as const;

const ITEMS_PER_PAGE_OPTIONS = [
  { label: "10", value: "10" },
  { label: "25", value: "25" },
  { label: "50", value: "50" },
];

type ExpandedRow = {
  key: string;
  response: ResponseListApiItem;
  question: SurveyResponseQuestionDto | null;
  rowType: "data" | "child";
};

function viewFromTabIndex(index: number): ResponseView {
  return index === 1 ? "archived" : "active";
}

function tabIndexFromView(view: ResponseView): number {
  return view === "archived" ? 1 : 0;
}

function expandResponses(responses: ResponseListApiItem[]): ExpandedRow[] {
  const rows: ExpandedRow[] = [];
  for (const response of responses) {
    const questions = response.dto.questions;
    if (questions.length === 0) {
      rows.push({
        key: response.id,
        response,
        question: null,
        rowType: "data",
      });
      continue;
    }
    questions.forEach((question, index) => {
      rows.push({
        key: `${response.id}-${question.questionId}-${index}`,
        response,
        question,
        rowType: index === 0 ? "data" : "child",
      });
    });
  }
  return rows;
}

function ResponseSubmittedAt({ iso }: { iso: string }) {
  const formatted = useClientFormattedDate(iso, formatResponseSubmittedAt);
  return (
    <Text as="span" variant="bodySm" tone="subdued">
      {formatted || "\u00a0"}
    </Text>
  );
}

function ResponseItemsPerPage({
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

const RESPONSES_TABLE_EMPTY_STATE = (
  <EmptySearchResult
    title="No responses found"
    description="Try changing the filters or search term"
    withIllustration
  />
);

export interface ResponseListIndexTableProps {
  responses: ResponseListApiItem[];
  view: ResponseView;
  onViewChange: (view: ResponseView) => void;
  onArchive?: (responseId: string) => void;
  onUnarchive?: (responseId: string) => void;
  archivingResponseId?: string | null;
  responseHref?: (responseId: string) => string;
}

/**
 * Competitor-style response IndexTable: grouped question rows, Active/Archived tabs.
 */
export function ResponseListIndexTable({
  responses,
  view,
  onViewChange,
  onArchive,
  onUnarchive,
  archivingResponseId = null,
  responseHref,
}: ResponseListIndexTableProps) {
  const navigate = useNavigate();
  const { mode, setMode } = useSetIndexFiltersMode();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const selectedTab = tabIndexFromView(view);

  const tabs = useMemo(
    () =>
      VIEW_TABS.map((label, index) => ({
        content: label,
        index,
        id: `response-view-${label.toLowerCase()}`,
        onAction: () => {
          onViewChange(viewFromTabIndex(index));
          setPage(0);
        },
        isLocked: true,
      })),
    [onViewChange],
  );

  const filteredResponses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length === 0) {
      return responses;
    }
    return responses.filter((response) => {
      const id = formatResponseDisplayId(response.dto).toLowerCase();
      if (id.includes(normalized) || response.surveyName.toLowerCase().includes(normalized)) {
        return true;
      }
      return response.dto.questions.some((question) => {
        const haystack = [
          question.question,
          answerTypeLabel(question.type),
          answerSearchText(question),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalized);
      });
    });
  }, [query, responses]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredResponses.length / itemsPerPage),
  );
  const currentPage = Math.min(page, pageCount - 1);
  const pageResponses = filteredResponses.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage,
  );
  const expandedRows = useMemo(
    () => expandResponses(pageResponses),
    [pageResponses],
  );

  const rowMarkup = expandedRows.map((row, index) => {
    const isParent = row.rowType === "data";
    const dto = row.response.dto;
    const displayId = formatResponseDisplayId(dto);
    const detailTo = responseHref?.(row.response.id);

    return (
      <IndexTable.Row
        id={row.key}
        key={row.key}
        position={index}
        rowType={row.rowType}
      >
        <IndexTable.Cell>
          {isParent ? (
            <BlockStack gap="050">
              <div className={styles.responseIdLink}>
                {detailTo ? (
                  <RouterLink to={detailTo} className={styles.responseIdRouterLink}>
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      {displayId}
                    </Text>
                  </RouterLink>
                ) : (
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {displayId}
                  </Text>
                )}
              </div>
              <ResponseSubmittedAt iso={dto.submittedAt} />
            </BlockStack>
          ) : null}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {isParent ? (
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              {row.response.surveyName}
            </Text>
          ) : null}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {row.question ? (
            <Text as="span" variant="bodySm">
              {row.question.question}
            </Text>
          ) : (
            <Text as="span" tone="subdued">
              —
            </Text>
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {row.question ? (
            <Badge tone="info">{answerTypeLabel(row.question.type)}</Badge>
          ) : null}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {row.question ? (
            <ResponseAnswerCell question={row.question} />
          ) : null}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {isParent ? (
            <InlineStack gap="100">
              <Button
                variant="tertiary"
                icon={ViewIcon}
                accessibilityLabel={`View response ${displayId}`}
                onClick={() => {
                  if (detailTo) {
                    navigate(detailTo);
                  }
                }}
                disabled={!detailTo}
              />
              {view === "active" && onArchive ? (
                <Button
                  variant="tertiary"
                  icon={ArchiveIcon}
                  accessibilityLabel={`Archive response ${displayId}`}
                  loading={archivingResponseId === row.response.id}
                  disabled={
                    archivingResponseId != null &&
                    archivingResponseId !== row.response.id
                  }
                  onClick={() => onArchive(row.response.id)}
                />
              ) : null}
              {view === "archived" && onUnarchive ? (
                <Button
                  variant="tertiary"
                  icon={ArchiveIcon}
                  accessibilityLabel={`Unarchive response ${displayId}`}
                  loading={archivingResponseId === row.response.id}
                  disabled={
                    archivingResponseId != null &&
                    archivingResponseId !== row.response.id
                  }
                  onClick={() => onUnarchive(row.response.id)}
                />
              ) : null}
            </InlineStack>
          ) : null}
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <>
      <div className={styles.indexFiltersTabs}>
        <IndexFilters
          tabs={tabs}
          selected={selectedTab}
          onSelect={(index) => {
            onViewChange(viewFromTabIndex(index));
            setPage(0);
          }}
          canCreateNewView={false}
          queryValue={query}
          queryPlaceholder="Search responses"
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
            setPage(0);
          }}
          hideFilters
          mode={mode}
          setMode={setMode}
          disableKeyboardShortcuts
          sortOptions={[
            {
              label: "Submitted",
              value: "submitted desc",
              directionLabel: "Newest",
            },
            {
              label: "Submitted",
              value: "submitted asc",
              directionLabel: "Oldest",
            },
          ]}
          sortSelected={["submitted desc"]}
          onSort={() => {}}
        />
      </div>
      <IndexTable
        selectable={false}
        resourceName={{ singular: "response", plural: "responses" }}
        itemCount={filteredResponses.length}
        headings={[
          { title: "Response ID" },
          { title: "Survey" },
          { title: "Question" },
          { title: "Answer type" },
          { title: "Answer" },
          { title: "Actions", hidden: true },
        ]}
        emptyState={RESPONSES_TABLE_EMPTY_STATE}
      >
        {rowMarkup}
      </IndexTable>
      {filteredResponses.length > 0 ? (
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
              <ResponseItemsPerPage
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
