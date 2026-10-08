import type {
  EditorPanel,
  QuestionType,
  SurveyDocument,
} from "../../../lib/survey/types";
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
}

/**
 * Left editor column: survey name, Content / Channel / Discount tabs,
 * then the list for the selected tab.
 */
export function EditorLeftPanel({
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
}: EditorLeftPanelProps) {
  return (
    <s-box
      padding="base"
      background="base"
      border="base"
      borderRadius="base"
      overflow="hidden"
      minBlockSize="720px"
    >
      <s-stack gap="base">
        <SurveyNameEditor
          name={survey.name}
          renaming={renaming}
          onRenaming={onRenaming}
          onRename={onRename}
        />

        <s-divider direction="inline" color="base" />

        <PanelTabs panel={panel} onPanel={onPanel} />

        <s-divider direction="inline" color="base" />

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
        {panel === "channel" ? <ChannelPanel survey={survey} /> : null}
        {panel === "discount" ? <DiscountPanel survey={survey} /> : null}
      </s-stack>
    </s-box>
  );
}
