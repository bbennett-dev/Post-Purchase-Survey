import type { CheckoutEditorLinks } from "../../../lib/shopify/checkout-editor-url.server";
import type {
  DiscountPreviewTarget,
  EditorPanel,
  QuestionType,
  SurveyChannel,
  SurveyDiscount,
  SurveyDocument,
  SurveyQuestion,
  ThankYouContent,
} from "../../../lib/survey/types";
import { EditorScrollPanel } from "../EditorScrollPanel";
import { ChannelInspector } from "./ChannelInspector";
import { ContentInspector } from "./ContentInspector";
import { DiscountInspector } from "./DiscountInspector";

export interface EditorRightPanelProps {
  panel: EditorPanel;
  survey: SurveyDocument;
  checkoutEditor: CheckoutEditorLinks;
  question: SurveyQuestion | null;
  ending: ThankYouContent | null;
  selectedChannelKey: string | null;
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
  onTypeChange: (type: QuestionType) => void;
  onEndingChange: (patch: Partial<ThankYouContent>) => void;
  onDeleteQuestion: () => void;
  onChannelChange: (channelKey: string, patch: SurveyChannel) => void;
  onDiscountChange: (patch: Partial<SurveyDiscount>) => void;
  selectedDiscountTarget: DiscountPreviewTarget;
}

/**
 * Right editor column. Switches inspector by the same tab as the left panel.
 */
export function EditorRightPanel({
  panel,
  survey,
  checkoutEditor,
  question,
  ending,
  selectedChannelKey,
  onQuestionChange,
  onTypeChange,
  onEndingChange,
  onDeleteQuestion,
  onChannelChange,
  onDiscountChange,
  selectedDiscountTarget,
}: EditorRightPanelProps) {
  return (
    <EditorScrollPanel accessibilityLabel="Survey settings inspector">
      {panel === "content" ? (
        <ContentInspector
          question={question}
          ending={ending}
          onQuestionChange={onQuestionChange}
          onTypeChange={onTypeChange}
          onEndingChange={onEndingChange}
          onDeleteQuestion={onDeleteQuestion}
        />
      ) : null}

      {panel === "channel" ? (
        <ChannelInspector
          survey={survey}
          checkoutEditor={checkoutEditor}
          selectedChannelKey={selectedChannelKey}
          onChannelChange={onChannelChange}
        />
      ) : null}

      {panel === "discount" ? (
        <DiscountInspector
          survey={survey}
          selectedDiscountTarget={selectedDiscountTarget}
          onDiscountChange={onDiscountChange}
        />
      ) : null}
    </EditorScrollPanel>
  );
}
