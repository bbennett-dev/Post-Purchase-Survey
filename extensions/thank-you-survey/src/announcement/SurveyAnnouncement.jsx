import { useCallback, useRef } from "preact/hooks";
import { SurveyBlock } from "../shared/survey/SurveyBlock.jsx";
import { resolvePostPurchaseAnnouncementCopy } from "../shared/survey/post-purchase-display.js";

/**
 * Post-purchase announcement bar: stacked teaser copy + modal survey flow.
 */
export function SurveyAnnouncement({
  survey,
  orderId,
  submitUrl,
  pageType,
  channelType,
  submissionContext = {},
  modalId,
}) {
  if (!survey) {
    return null;
  }

  const { modalTitle, content, buttonText } =
    resolvePostPurchaseAnnouncementCopy(survey);
  const modalRef = useRef(null);

  /** Stacked copy can exceed default bar height; avoid expand swallowing the first tap. */
  const handleOpenSurvey = useCallback((event) => {
    event?.stopPropagation?.();
    modalRef.current?.showOverlay?.();
  }, []);

  return (
    <s-announcement>
      <s-stack gap="small-100" alignItems="center">
        <s-text>{content}</s-text>
        <s-link
          commandFor={modalId}
          command="--show"
          onClick={handleOpenSurvey}
        >
          {buttonText}
        </s-link>
      </s-stack>
      <s-modal
        id={modalId}
        ref={modalRef}
        heading={modalTitle}
        size="large"
      >
        <s-scroll-box maxBlockSize="70vh">
          <SurveyBlock
            survey={survey}
            orderId={orderId}
            submitUrl={submitUrl}
            pageType={pageType}
            channelType={channelType}
            submissionContext={submissionContext}
            shell="plain"
          />
        </s-scroll-box>
      </s-modal>
    </s-announcement>
  );
}
