import { BlockStack, Box, Divider } from "@shopify/polaris";
import type {
  DiscountPreviewTarget,
  EditorPanel,
  QuestionType,
  SurveyChannel,
  SurveyDiscount,
  SurveyDocument,
} from "../../../lib/survey/types";
import { EditorScrollPanel } from "../EditorScrollPanel";
import { ChannelPanel } from "./Channel";
import { ContentPanel } from "./Content";
import { DiscountPanel } from "./Discount";
import { PanelTabs } from "./PanelTabs";
import { SurveyNameEditor } from "./SurveyNameEditor";

export interface EditorLeftPanelProps {
  survey: SurveyDocument;
  panel: EditorPanel;
  renaming: boolean;
  selectedQuestionId: string;
  selectedEndingId: string | null;
  showTranslationTip: boolean;
  onPanel: (panel: EditorPanel) => void;
  onRenaming: (renaming: boolean) => void;
  onRename: (name: string) => void;
  onSelectQuestion: (id: string) => void;
  onSelectEnding: (id: string) => void;
  onDismissTranslation: () => void;
  onAddQuestion: (type: QuestionType) => void;
  onMoveQuestion: (id: string, direction: -1 | 1) => void;
  onReorderQuestion: (order: string[]) => void;
  onDeleteQuestion: (id: string) => void;
  onAddEnding: () => void;
  onSetMain: (id: string) => void;
  onDeleteEnding: (id: string) => void;
  selectedChannelKey: string | null;
  onSelectChannel: (channelKey: string) => void;
  onChannelChange: (channelKey: string, patch: SurveyChannel) => void;
  selectedDiscountTarget: DiscountPreviewTarget;
  onSelectDiscountTarget: (target: DiscountPreviewTarget) => void;
  onDiscountChange: (patch: Partial<SurveyDiscount>) => void;
}

/**
 * Left editor column: pinned name + tabs; tab body scrolls inside a fixed-height panel.
 */
export function EditorLeftPanel(props: EditorLeftPanelProps) {
  const {
    survey,
    panel,
    renaming,
    selectedQuestionId,
    selectedEndingId,
    showTranslationTip,
    onPanel,
    onRenaming,
    onRename,
    onSelectQuestion,
    onSelectEnding,
    onDismissTranslation,
    onAddQuestion,
    onMoveQuestion,
    onReorderQuestion,
    onDeleteQuestion,
    onAddEnding,
    onSetMain,
    onDeleteEnding,
    selectedChannelKey,
    onSelectChannel,
    onChannelChange,
    selectedDiscountTarget,
    onSelectDiscountTarget,
    onDiscountChange,
  } = props;

  return (
    <EditorScrollPanel
      accessibilityLabel="Survey structure and channels"
      bordered={false}
      header={
        <BlockStack gap="0">
          <Box paddingBlockEnd="300">
            <SurveyNameEditor
              name={survey.name}
              renaming={renaming}
              onRenaming={onRenaming}
              onRename={onRename}
            />
          </Box>
          <Divider />
          <Box paddingBlock="300">
            <PanelTabs panel={panel} onPanel={onPanel} />
          </Box>
          <Divider />
        </BlockStack>
      }
    >
      {panel === "content" ? (
        <ContentPanel
          survey={survey}
          selectedQuestionId={selectedQuestionId}
          selectedEndingId={selectedEndingId}
          showTranslationTip={showTranslationTip}
          onSelectQuestion={onSelectQuestion}
          onSelectEnding={onSelectEnding}
          onDismissTranslation={onDismissTranslation}
          onAddQuestion={onAddQuestion}
          onMoveQuestion={onMoveQuestion}
          onReorderQuestion={onReorderQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onAddEnding={onAddEnding}
          onSetMain={onSetMain}
          onDeleteEnding={onDeleteEnding}
        />
      ) : null}
      {panel === "channel" ? (
        <ChannelPanel
          survey={survey}
          selectedChannelKey={selectedChannelKey}
          onSelectChannel={onSelectChannel}
          onChannelChange={onChannelChange}
        />
      ) : null}
      {panel === "discount" ? (
        <DiscountPanel
          survey={survey}
          selectedDiscountTarget={selectedDiscountTarget}
          onSelectDiscountTarget={onSelectDiscountTarget}
          onDiscountChange={onDiscountChange}
        />
      ) : null}
    </EditorScrollPanel>
  );
}
