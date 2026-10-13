import { useState } from "react";
import { BlockStack, Box, Text } from "@shopify/polaris";
import {
  applyQuestionOrder,
  changeQuestionType,
  createEnding,
  createQuestion,
  moveQuestion,
} from "../../lib/survey/questions";
import type {
  DiscountPreviewTarget,
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
import { EditorScrollPanel } from "./EditorScrollPanel";
import { EditorPreview } from "./EditorPreview";
import { EditorToolbar } from "./EditorToolbar";
import {
  EditorFlexColumn,
  EditorFlexMain,
  EditorGridCell,
  EditorGridShell,
} from "./EditorFlexLayout";

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
  const [selectedDiscountTarget, setSelectedDiscountTarget] =
    useState<DiscountPreviewTarget>("thankYouCard");
  const [renaming, setRenaming] = useState(false);
  const [showTranslationTip, setShowTranslationTip] = useState(
    Object.keys(survey.translation).length > 0,
  );

  const selectedQuestion =
    survey.questions.find((question) => question.id === selectedQuestionId) ??
    null;
  const selectedEnding =
    survey.thankYouCards.find((card) => card.id === selectedEndingId) ?? null;

  const questionIndex = selectedQuestion
    ? survey.questions.findIndex((q) => q.id === selectedQuestion.id)
    : 0;

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

  const showSidePanels = device !== "fullscreen";
  const gridColumns = showSidePanels
    ? "minmax(300px, 340px) minmax(0, 1fr) minmax(295px, 345px)"
    : "minmax(0, 1fr)";

  return (
    <EditorFlexColumn gap="0" style={{ flex: 1, minHeight: 0 }}>
      <EditorToolbar
        workspace={workspace}
        device={device}
        isActive={survey.isActive}
        checkoutEditor={checkoutEditor}
        onWorkspace={setWorkspace}
        onDevice={setDevice}
        onActive={(isActive) => onSurveyChange({ ...survey, isActive })}
      />

      <EditorFlexMain>
        <EditorGridShell gridTemplateColumns={gridColumns}>
          {showSidePanels ? (
            <EditorGridCell>
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
                selectedDiscountTarget={selectedDiscountTarget}
                onSelectDiscountTarget={setSelectedDiscountTarget}
                onDiscountChange={(patch) => {
                  onSurveyChange({
                    ...survey,
                    discount: { ...survey.discount, ...patch },
                  });
                }}
              />
            </EditorGridCell>
          ) : null}

          <EditorGridCell>
            {workspace === "logic" ? (
              <EditorScrollPanel accessibilityLabel="Advanced logic">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Advanced logic
                  </Text>
                  <Text as="p" tone="subdued">
                    Branching rules for this survey will be edited on this
                    canvas. Advanced logic is{" "}
                    {survey.advancedLogicEnabled ? "on" : "off"}.
                  </Text>
                </BlockStack>
              </EditorScrollPanel>
            ) : (
              <EditorPreview
                question={selectedEnding ? null : selectedQuestion}
                device={device}
                ending={selectedEnding}
                questionIndex={Math.max(0, questionIndex)}
                questionCount={Math.max(1, survey.questions.length)}
                shopLabel={survey.name}
              />
            )}
          </EditorGridCell>

          {showSidePanels ? (
            <EditorGridCell>
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
                selectedDiscountTarget={selectedDiscountTarget}
              />
            </EditorGridCell>
          ) : null}
        </EditorGridShell>
      </EditorFlexMain>
    </EditorFlexColumn>
  );
}
