import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  IndexTable,
  InlineStack,
  Layout,
  Link,
  Page,
  Popover,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import {
  ArchiveIcon,
  ChartVerticalIcon,
  ExportIcon,
} from "@shopify/polaris-icons";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import type { ResponseView } from "../../lib/routes/responses-route";
import {
  responseDetailHref,
  responsesHref,
} from "../../lib/routes/responses-route";
import { useClientFormattedDate } from "../../lib/routes/use-client-formatted-date";
import {
  customerEmail,
  deliveryMethodTypeLabel,
  displayOrDash,
  formatPageSubmittedLabel,
  formatResponseDetailSubmittedAt,
  primaryCustomerTag,
  productCountLabel,
  productLineCount,
  variantProductLineSubtitle,
  variantProductLineTitle,
} from "../../lib/survey/response/response-detail-formatters";
import styles from "./response-detail-page.module.css";
import type { ResponseListApiItem } from "../../lib/survey/response/response-list-api.server";
import {
  answerTypeLabel,
  formatResponseDisplayId,
} from "../../lib/survey/response/response-list-formatters";
import { ResponseAnswerCell } from "./ResponseAnswerCell";

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <BlockStack gap="100">
      <Text as="p" variant="bodySm" fontWeight="semibold">
        {label}
      </Text>
      {children}
    </BlockStack>
  );
}

function ProductsPurchasedField({ item }: { item: ResponseListApiItem }) {
  const dto = item.dto;
  const count = productLineCount(dto);
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const showPopover = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClosePopover = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  };

  if (count === 0) {
    return (
      <Text as="span" variant="bodyMd">
        —
      </Text>
    );
  }

  const hoverTargetProps = {
    onMouseEnter: showPopover,
    onMouseLeave: scheduleClosePopover,
  };

  const activator = (
    <span {...hoverTargetProps}>
      <Button variant="plain">{productCountLabel(count)}</Button>
    </span>
  );

  return (
    <Popover
      active={open}
      activator={activator}
      onClose={() => setOpen(false)}
      preferredAlignment="left"
      preferredPosition="above"
      autofocusTarget="none"
      fluidContent
    >
      <Popover.Pane sectioned>
        <span {...hoverTargetProps}>
        <Box minWidth="320px">
          <BlockStack gap="400">
            <Text as="h3" variant="headingSm">
              Products
            </Text>
            {dto.variants.length > 0 ? (
              dto.variants.map((variant) => {
                const imageUrl =
                  variant.image ?? variant.product?.featuredImage?.url ?? null;
                const primaryTitle = variantProductLineTitle(
                  variant,
                  dto.productName,
                );
                return (
                  <InlineStack
                    key={variant.id}
                    gap="400"
                    blockAlign="center"
                    wrap={false}
                  >
                    {imageUrl ? (
                      <Thumbnail
                        source={imageUrl}
                        alt={primaryTitle}
                        size="medium"
                      />
                    ) : null}
                    <BlockStack gap="100">
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        {primaryTitle}
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {variantProductLineSubtitle(variant)}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                );
              })
            ) : (
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {displayOrDash(dto.productName)}
              </Text>
            )}
          </BlockStack>
        </Box>
        </span>
      </Popover.Pane>
    </Popover>
  );
}

export interface ResponseDetailPageProps {
  item: ResponseListApiItem;
  view: ResponseView;
  surveyFilter: string | null;
  siblingIds: string[];
  onArchiveToggle: (responseId: string, archive: boolean) => void;
  archivePending: boolean;
}

/**
 * Competitor-style response detail: questions table + sidebar metadata.
 * Data comes from the parent list loader (no fetch-by-id).
 */
export function ResponseDetailPage({
  item,
  view,
  surveyFilter,
  siblingIds,
  onArchiveToggle,
  archivePending,
}: ResponseDetailPageProps) {
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const dto = item.dto;
  const displayId = formatResponseDisplayId(dto);
  const listHref = responsesHref({ view, survey: surveyFilter });
  const submittedSubtitle = useClientFormattedDate(
    dto.submittedAt,
    formatResponseDetailSubmittedAt,
  );

  const index = siblingIds.indexOf(item.id);
  const prevId = index > 0 ? siblingIds[index - 1] : null;
  const nextId =
    index >= 0 && index < siblingIds.length - 1 ? siblingIds[index + 1] : null;

  const navOptions = useMemo(
    () => ({ view, survey: surveyFilter }),
    [view, surveyFilter],
  );

  const notifySoon = useCallback(
    (label: string) => {
      shopify.toast.show(`${label} — coming soon`);
    },
    [shopify],
  );

  const deliveryType = deliveryMethodTypeLabel(dto.deliveryMethodType);
  const customerTag = primaryCustomerTag(dto);

  const rowMarkup = dto.questions.map((question, index) => (
    <IndexTable.Row
      id={`${question.questionId}-${index}`}
      key={`${question.questionId}-${index}`}
      position={index}
    >
      <IndexTable.Cell>
        <Text as="span" variant="bodySm">
          {displayOrDash(question.question)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone="info">{answerTypeLabel(question.type)}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <ResponseAnswerCell question={question} />
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      backAction={{
        content: "Responses",
        onAction: () => navigate(listHref),
      }}
      title={`Response ${displayId}`}
      subtitle={submittedSubtitle || "\u00a0"}
      secondaryActions={[
        {
          content: dto.isArchived ? "Unarchive response" : "Archive response",
          icon: ArchiveIcon,
          onAction: () => onArchiveToggle(item.id, !dto.isArchived),
          loading: archivePending,
        },
      ]}
      // pagination={{
      //   hasPrevious: prevId != null,
      //   hasNext: nextId != null,
      //   onPrevious: prevId
      //     ? () => navigate(responseDetailHref(prevId, navOptions))
      //     : undefined,
      //   onNext: nextId
      //     ? () => navigate(responseDetailHref(nextId, navOptions))
      //     : undefined,
      // }}
      // primaryAction={{
      //   content: "Export response",
      //   icon: ExportIcon,
      //   onAction: () => notifySoon("Export response"),
      // }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexTable
              selectable={false}
              resourceName={{ singular: "question", plural: "questions" }}
              itemCount={dto.questions.length}
              headings={[
                { title: "Question" },
                { title: "Answer type" },
                { title: "Answer" },
              ]}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingSm">
                  Response detail
                </Text>
                <DetailField label="Survey">
                  <InlineStack gap="100" blockAlign="center">
                    <Text as="span" variant="bodyMd">
                      {displayOrDash(dto.surveyName)}
                    </Text>
                    {/* <Button
                      variant="plain"
                      icon={ChartVerticalIcon}
                      accessibilityLabel="Survey analytics"
                      url={`/app/responses?survey=${encodeURIComponent(dto.surveyUuid)}`}
                    /> */}
                  </InlineStack>
                </DetailField>
                <DetailField label="Page submitted">
                  <Text as="span" variant="bodyMd">
                    {formatPageSubmittedLabel(dto.pageType)}
                  </Text>
                </DetailField>
                <DetailField label="Order ID">
                  <Text as="span" variant="bodyMd" tone="base">
                    {displayOrDash(dto.orderName ?? dto.orderId)}
                  </Text>
                </DetailField>
                <DetailField label="Delivery method">
                  {deliveryType ? (
                    <InlineStack gap="200" blockAlign="center">
                      <Badge tone="info">{deliveryType}</Badge>
                      <Text as="span" variant="bodyMd">
                        {displayOrDash(dto.deliveryMethodTitle)}
                      </Text>
                    </InlineStack>
                  ) : (
                    <Text as="span" variant="bodyMd">
                      —
                    </Text>
                  )}
                </DetailField>
                <DetailField label="Products purchased">
                  <ProductsPurchasedField item={item} />
                </DetailField>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingSm">
                  Customer information
                </Text>
                {customerTag !== "—" ? (
                  <span className={styles.fitBadge}>
                    <Badge>{customerTag}</Badge>
                  </span>
                ) : (
                  <Text as="span" variant="bodyMd">
                    —
                  </Text>
                )}
                <DetailField label="Email">
                  {customerEmail(dto) === "—" ? (
                    <Text as="span" variant="bodyMd">
                      —
                    </Text>
                  ) : (
                    <Link url={`mailto:${customerEmail(dto)}`} removeUnderline>
                      {customerEmail(dto)}
                    </Link>
                  )}
                </DetailField>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
