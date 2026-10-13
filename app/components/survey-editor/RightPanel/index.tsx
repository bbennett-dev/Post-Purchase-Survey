import { BlockStack, Box, Divider } from "@shopify/polaris";
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
import {
  buildRightPanelHeader,
  RightPanelHeaderBar,
} from "./RightPanelHeader";

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
 * Right column: pinned title/actions + scrollable inspector (no outer border).
 */
export function EditorRightPanel(props: EditorRightPanelProps) {
  const {
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
  } = props;

  const { title, actions } = buildRightPanelHeader({
    panel,
    survey,
    question,
    ending,
    selectedChannelKey,
    selectedDiscountTarget,
  });

  return (
    <EditorScrollPanel
      accessibilityLabel="Survey settings inspector"
      bordered={false}
      header={
        <BlockStack gap="0">
          <Box paddingBlockEnd="300" paddingInline="400">
            <RightPanelHeaderBar title={title} actions={actions} />
          </Box>
          <Divider />
        </BlockStack>
      }
    >
      {/* Match left Content tab: SectionLabel uses paddingBlockStart="500" below the header divider. */}
      <Box paddingBlockStart="500">
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
      </Box>
    </EditorScrollPanel>
  );
}
