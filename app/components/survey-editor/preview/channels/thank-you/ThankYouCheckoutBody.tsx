import { useState, type ReactNode } from "react";
import { BlockStack, Box, Text } from "@shopify/polaris";
import {
  isPostPurchaseAnnouncementBar,
  resolvePostPurchaseAnnouncementCopy,
} from "../../../../../lib/survey/post-purchase-display";
import type { UseInteractiveSurveyPreviewResult } from "../../useInteractiveSurveyPreview";
import type { EditorPreviewFrameProps } from "../../types";
import { SurveyPreviewStep } from "../../SurveyPreviewStep";
import { ThankYouConfirmationHeader } from "./ThankYouConfirmationHeader";
import { ThankYouOrderSummary } from "./ThankYouOrderSummary";
import { THANK_YOU_PREVIEW_ORDER } from "./mock-order";
import { AnnouncementBarPreviewStrip } from "./post-purchase/AnnouncementBarPreviewStrip";
import { AnnouncementBarSurveyModal } from "./post-purchase/AnnouncementBarSurveyModal";

interface ThankYouCheckoutBodyProps extends EditorPreviewFrameProps {
  layout: "fullscreen" | "desktop" | "mobile";
  surveyFlow: UseInteractiveSurveyPreviewResult;
}

/**
 * Shared thank-you / order-status checkout mock (confirmation + survey + summary).
 */
export function ThankYouCheckoutBody({
  storeLabel,
  layout,
  surveyFlow,
  postPurchaseChannel,
}: ThankYouCheckoutBodyProps) {
  const storeName =
    storeLabel.trim().length > 0 ? storeLabel : "Store name";
  const order = THANK_YOU_PREVIEW_ORDER;
  const twoColumn = layout === "fullscreen" || layout === "desktop";
  const mobileStack = layout === "mobile";
  const showConfirmation = true;

  const announcementMode = isPostPurchaseAnnouncementBar(postPurchaseChannel);
  const announcementCopy = resolvePostPurchaseAnnouncementCopy(
    postPurchaseChannel,
    storeLabel,
  );
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);

  const surveyBlock = announcementMode ? null : (
    <SurveyPreviewStep
      phase={surveyFlow.phase}
      question={surveyFlow.question}
      thankYou={surveyFlow.thankYou}
      questionIndex={surveyFlow.questionIndex}
      questionCount={surveyFlow.questionCount}
      draft={surveyFlow.draft}
      errorMessage={surveyFlow.errorMessage}
      isLastQuestion={surveyFlow.isLastQuestion}
      canGoBack={surveyFlow.canGoBack}
      onDraftChange={surveyFlow.setDraft}
      onBack={surveyFlow.goBack}
      onNext={surveyFlow.goNext}
    />
  );

  const announcementBar = announcementMode ? (
    <AnnouncementBarPreviewStrip
      copy={announcementCopy}
      onOpenSurvey={() => setAnnouncementModalOpen(true)}
    />
  ) : null;

  return (
    <BlockStack gap="0">
      {announcementBar}

      <Box
        padding="400"
        paddingInline={layout === "mobile" ? "400" : "600"}
        background="bg-surface"
        borderBlockEndWidth="025"
        borderColor="border"
      >
        <Text as="p" variant="headingMd" fontWeight="bold">
          {storeName}
        </Text>
      </Box>

      {mobileStack ? (
        <BlockStack gap="0">
          <ThankYouMainColumn
            order={order}
            compact
            showConfirmation={showConfirmation}
            surveyBlock={surveyBlock}
          />
          <ThankYouOrderSummary />
        </BlockStack>
      ) : twoColumn ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)",
            alignItems: "stretch",
            minHeight: layout === "fullscreen" ? "min(720px, 70vh)" : undefined,
          }}
        >
          <ThankYouMainColumn
            order={order}
            compact={layout === "desktop"}
            centerContent={layout === "fullscreen"}
            showConfirmation={showConfirmation}
            surveyBlock={surveyBlock}
          />
          <ThankYouOrderSummary />
        </div>
      ) : (
        <ThankYouMainColumn
          order={order}
          compact={false}
          showConfirmation={showConfirmation}
          surveyBlock={surveyBlock}
        />
      )}

      {announcementMode ? (
        <AnnouncementBarSurveyModal
          open={announcementModalOpen}
          onClose={() => setAnnouncementModalOpen(false)}
          copy={announcementCopy}
          channel={postPurchaseChannel}
          surveyFlow={surveyFlow}
        />
      ) : null}
    </BlockStack>
  );
}

function ThankYouMainColumn({
  order,
  compact,
  centerContent,
  showConfirmation,
  surveyBlock,
}: {
  order: typeof THANK_YOU_PREVIEW_ORDER;
  compact: boolean;
  centerContent?: boolean;
  showConfirmation: boolean;
  surveyBlock: ReactNode;
}) {
  const columnContentStyle = centerContent
    ? {
        width: "100%",
        maxWidth: "480px",
        marginInline: "auto",
      }
    : { width: "100%" };

  return (
    <Box
      padding={compact ? "500" : "600"}
      background="bg-surface"
      borderInlineEndWidth="025"
      borderColor="border"
    >
      <div style={columnContentStyle}>
        <BlockStack gap="500">
          {showConfirmation ? (
            <ThankYouConfirmationHeader
              confirmationCode={order.confirmationCode}
              customerName={order.customerName}
            />
          ) : null}

          {surveyBlock}

          {showConfirmation ? (
            <BlockStack gap="100">
              <Text as="p" variant="headingSm">
                Your order is confirmed
              </Text>
              <Text as="p" tone="subdued">
                You&apos;ll get a confirmation email with your order number soon.
              </Text>
            </BlockStack>
          ) : null}
        </BlockStack>
      </div>
    </Box>
  );
}
