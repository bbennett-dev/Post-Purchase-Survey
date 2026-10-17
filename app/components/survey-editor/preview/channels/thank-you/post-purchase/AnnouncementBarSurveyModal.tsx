import { BlockStack, Box, Modal } from "@shopify/polaris";
import type { PostPurchasePageChannel } from "../../../../../../lib/survey/types";
import type { ResolvedPostPurchaseAnnouncementCopy } from "../../../../../../lib/survey/post-purchase-display";
import type { UseInteractiveSurveyPreviewResult } from "../../../useInteractiveSurveyPreview";
import { SurveyPreviewStep } from "../../../SurveyPreviewStep";

export interface AnnouncementBarSurveyModalProps {
  open: boolean;
  onClose: () => void;
  copy: ResolvedPostPurchaseAnnouncementCopy;
  channel?: PostPurchasePageChannel;
  surveyFlow: UseInteractiveSurveyPreviewResult;
}

/**
 * Polaris modal preview for post-purchase announcement bar surveys.
 */
export function AnnouncementBarSurveyModal({
  open,
  onClose,
  copy,
  channel,
  surveyFlow,
}: AnnouncementBarSurveyModalProps) {
  const sideLogoUrl =
    channel?.enabledSideLogo && channel.sideLogo?.url
      ? channel.sideLogo.url
      : null;

  return (
    <Modal open={open} onClose={onClose} title={copy.modalTitle}>
      <Modal.Section>
        <BlockStack gap="400">
          {sideLogoUrl ? (
            <Box>
              <img
                src={sideLogoUrl}
                alt=""
                style={{
                  maxWidth: "120px",
                  maxHeight: "80px",
                  objectFit: "contain",
                }}
              />
            </Box>
          ) : null}
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
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
