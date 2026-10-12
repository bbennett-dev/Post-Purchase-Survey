import { useState } from "react";
import {
  applyQuestionOrder,
  changeQuestionType,
  createEnding,
  createQuestion,
  moveQuestion,
} from "../../lib/survey/questions";
import type {
  EditorPanel,
  EditorWorkspace,
  PreviewDevice,
  SurveyChannel,
  SurveyDocument,
  SurveyQuestion,
} from "../../lib/survey/types";
import type { CheckoutEditorLinks } from "../../lib/shopify/checkout-editor-url.server";
import { EditorLeftPanel } from "./LeftPanel";
import { EditorRightPanel } from "./RightPanel";
import chromeStyles from "./editor-chrome.module.css";
import scrollPanelStyles from "./editor-scroll-panel.module.css";
import { EditorScrollRegion } from "./EditorScrollRegion";
import { EditorPreview } from "./EditorPreview";
import { EditorToolbar } from "./EditorToolbar";

interface SurveyEditorChromeProps {
  survey: SurveyDocument;
  checkoutEditor: CheckoutEditorLinks;
  onSurveyChange: (survey: SurveyDocument) => void;
}

/**
 * Survey editor shell. Owns document state wiring and composes the
 * toolbar, left panel, preview, and inspector.
 */
export function SurveyEditorChrome({
  survey,
  checkoutEditor,
  onSurveyChange,
}: SurveyEditorChromeProps) {
  const [workspace, setWorkspace] = useState<EditorWorkspace>("build");
  const [panel, setPanel] = useState<EditorPanel>("content");
  const [device, setDevice] = useState<PreviewDevice>("mobile");
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    survey.questions[0]?.id ?? "",
  );
  const [selectedEndingId, setSelectedEndingId] = useState<string | null>(null);
  const [selectedChannelKey, setSelectedChannelKey] = useState<string | null>(
    "postPurchasePage",
  );
  const [renaming, setRenaming] = useState(false);
  const [showTranslationTip, setShowTranslationTip] = useState(
    Object.keys(survey.translation).length > 0,
  );

  const selectedQuestion =
    survey.questions.find((question) => question.id === selectedQuestionId) ??
    null;
  const selectedEnding =
    survey.thankYouCards.find((card) => card.id === selectedEndingId) ?? null;

  const updateQuestions = (questions: SurveyQuestion[]) => {
    onSurveyChange({ ...survey, questions });
  };

  const patchQuestion = (id: string, patch: Partial<SurveyQuestion>) => {
    updateQuestions(
      survey.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    );
  };

  const selectQuestion = (id: string) => {
    setSelectedEndingId(null);
    setSelectedQuestionId(id);
  };

  const setPanelWithDefaults = (next: EditorPanel) => {
    setPanel(next);
    if (next === "channel" && !selectedChannelKey) {
      setSelectedChannelKey("postPurchasePage");
    }
  };

  const selectChannel = (channelKey: string) => {
    setSelectedChannelKey(channelKey.length > 0 ? channelKey : null);
  };

  const handleChannelChange = (channelKey: string, patch: SurveyChannel) => {
    const current = survey.channels[channelKey] ?? { type: channelKey };
    const nextChannel = { ...current, ...patch };
    const channels = { ...survey.channels, [channelKey]: nextChannel };
    if (!("enabled" in patch)) {
      onSurveyChange({ ...survey, channels });
      return;
    }
    const enabled = nextChannel.enabled === true;
    const channelTypes = enabled
      ? survey.channelTypes.includes(channelKey)
        ? survey.channelTypes
        : [...survey.channelTypes, channelKey]
      : survey.channelTypes.filter((key) => key !== channelKey);
    onSurveyChange({ ...survey, channels, channelTypes });
  };

  const columnsClass =
    device === "fullscreen"
      ? `${chromeStyles.editorColumns} ${chromeStyles.editorColumnsFullscreen}`
      : chromeStyles.editorColumns;

  return (
    <div className={chromeStyles.editorRoot}>
      <div className={chromeStyles.editorToolbarSlot}>
        <EditorToolbar
          workspace={workspace}
          device={device}
          isActive={survey.isActive}
          onWorkspace={setWorkspace}
          onDevice={setDevice}
          onActive={(isActive) => onSurveyChange({ ...survey, isActive })}
        />
      </div>

      <div className={columnsClass}>
        {device === "fullscreen" ? null : (
          <div className={chromeStyles.editorColumn}>
            <EditorLeftPanel
              survey={survey}
              panel={panel}
              renaming={renaming}
              selectedQuestionId={selectedEnding ? "" : selectedQuestionId}
              selectedEndingId={selectedEndingId}
              showTranslationTip={showTranslationTip}
              onPanel={setPanelWithDefaults}
              selectedChannelKey={selectedChannelKey}
              onSelectChannel={selectChannel}
              onRenaming={setRenaming}
              onRename={(name) => onSurveyChange({ ...survey, name })}
              onSelectQuestion={selectQuestion}
              onSelectEnding={(id) => {
                setSelectedQuestionId("");
                setSelectedEndingId(id);
              }}
              onDismissTranslation={() => setShowTranslationTip(false)}
              onAddQuestion={(type) => {
                const question = createQuestion(type, survey.questions.length);
                updateQuestions([...survey.questions, question]);
                selectQuestion(question.id);
              }}
              onMoveQuestion={(id, direction) => {
                const index = survey.questions.findIndex(
                  (question) => question.id === id,
                );
                const next = index + direction;
                if (
                  index < 0 ||
                  next < 0 ||
                  next >= survey.questions.length
                ) {
                  return;
                }
                const target = survey.questions[next];
                updateQuestions(moveQuestion(survey.questions, id, target.id));
              }}
              onReorderQuestion={(order) => {
                updateQuestions(applyQuestionOrder(survey.questions, order));
              }}
              onDeleteQuestion={(id) => {
                const questions = survey.questions
                  .filter((question) => question.id !== id)
                  .map((question, position) => ({ ...question, position }));
                updateQuestions(questions);
                if (selectedQuestionId === id) {
                  setSelectedQuestionId(questions[0]?.id ?? "");
                }
              }}
              onAddEnding={() => {
                const card = createEnding();
                onSurveyChange({
                  ...survey,
                  thankYouCards: [...survey.thankYouCards, card],
                });
                setSelectedQuestionId("");
                setSelectedEndingId(card.id ?? null);
              }}
              onSetMain={(id) => {
                const cards = survey.thankYouCards.map((card) => ({
                  ...card,
                  isDefault: card.id === id,
                }));
                const main = cards.find((card) => card.id === id);
                onSurveyChange({
                  ...survey,
                  thankYouCards: cards,
                  thankYou: main
                    ? { ...survey.thankYou, ...main, isDefault: true }
                    : survey.thankYou,
                });
              }}
              onDeleteEnding={(id) => {
                const target = survey.thankYouCards.find(
                  (card) => card.id === id,
                );
                // Main ending cannot be deleted; keep exactly one Main.
                if (!target || target.isDefault || survey.thankYouCards.length < 2) {
                  return;
                }
                const cards = survey.thankYouCards.filter(
                  (card) => card.id !== id,
                );
                onSurveyChange({ ...survey, thankYouCards: cards });
                if (selectedEndingId === id) {
                  setSelectedEndingId(null);
                  setSelectedQuestionId(survey.questions[0]?.id ?? "");
                }
              }}
              onChannelChange={handleChannelChange}
            />
          </div>
        )}

        <div className={chromeStyles.editorColumn}>
          {workspace === "logic" ? (
            <div className={scrollPanelStyles.previewColumn}>
              <EditorScrollRegion accessibilityLabel="Advanced logic">
                <s-stack gap="small-200">
                  <s-heading>Advanced logic</s-heading>
                  <s-paragraph color="subdued">
                    Branching rules for this survey will be edited on this
                    canvas. Advanced logic is{" "}
                    {survey.advancedLogicEnabled ? "on" : "off"}.
                  </s-paragraph>
                </s-stack>
              </EditorScrollRegion>
            </div>
          ) : (
            <EditorPreview
              question={selectedEnding ? null : selectedQuestion}
              device={device}
              ending={selectedEnding}
            />
          )}
        </div>

        {device === "fullscreen" ? null : (
          <div className={chromeStyles.editorColumn}>
            <EditorRightPanel
              panel={panel}
              survey={survey}
              checkoutEditor={checkoutEditor}
              question={selectedEnding ? null : selectedQuestion}
              ending={selectedEnding}
              selectedChannelKey={selectedChannelKey}
              onQuestionChange={(patch) => {
                if (selectedQuestion) {
                  patchQuestion(selectedQuestion.id, patch);
                }
              }}
              onTypeChange={(type) => {
                if (!selectedQuestion) {
                  return;
                }
                patchQuestion(
                  selectedQuestion.id,
                  changeQuestionType(selectedQuestion, type),
                );
              }}
              onEndingChange={(patch) => {
                if (!selectedEnding?.id) {
                  return;
                }
                const cards = survey.thankYouCards.map((card) =>
                  card.id === selectedEnding.id ? { ...card, ...patch } : card,
                );
                const next = cards.find(
                  (card) => card.id === selectedEnding.id,
                );
                onSurveyChange({
                  ...survey,
                  thankYouCards: cards,
                  thankYou:
                    next?.isDefault === true
                      ? { ...survey.thankYou, ...patch }
                      : survey.thankYou,
                });
              }}
              onDeleteQuestion={() => {
                if (!selectedQuestion) {
                  return;
                }
                const questions = survey.questions
                  .filter((question) => question.id !== selectedQuestion.id)
                  .map((question, position) => ({ ...question, position }));
                updateQuestions(questions);
                setSelectedQuestionId(questions[0]?.id ?? "");
              }}
              onChannelChange={handleChannelChange}
              onDiscountChange={(patch) => {
                onSurveyChange({
                  ...survey,
                  discount: { ...survey.discount, ...patch },
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
