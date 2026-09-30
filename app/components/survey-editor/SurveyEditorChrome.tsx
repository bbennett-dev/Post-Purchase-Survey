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
  SurveyDocument,
  SurveyQuestion,
} from "../../lib/survey/types";
import { EditorInspector } from "./EditorInspector";
import { EditorLeftPanel } from "./EditorLeftPanel";
import { EditorPreview } from "./EditorPreview";
import { EditorToolbar } from "./EditorToolbar";

interface SurveyEditorChromeProps {
  survey: SurveyDocument;
  onSurveyChange: (survey: SurveyDocument) => void;
}

/**
 * Survey editor shell. Owns document state wiring and composes the
 * toolbar, left panel, preview, and inspector.
 */
export function SurveyEditorChrome({
  survey,
  onSurveyChange,
}: SurveyEditorChromeProps) {
  const [workspace, setWorkspace] = useState<EditorWorkspace>("build");
  const [panel, setPanel] = useState<EditorPanel>("content");
  const [device, setDevice] = useState<PreviewDevice>("mobile");
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    survey.questions[0]?.id ?? "",
  );
  const [selectedEndingId, setSelectedEndingId] = useState<string | null>(null);
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

  return (
    <s-stack gap="small">
      <EditorToolbar
        workspace={workspace}
        device={device}
        isActive={survey.isActive}
        onWorkspace={setWorkspace}
        onDevice={setDevice}
        onActive={(isActive) => onSurveyChange({ ...survey, isActive })}
      />

      <s-grid
        gridTemplateColumns={
          device === "fullscreen" ? "1fr" : "300px 1fr 300px"
        }
        gap="small"
        alignItems="start"
      >
        {device === "fullscreen" ? null : (
          <s-box inlineSize="300px" overflow="hidden">
            <EditorLeftPanel
              survey={survey}
              panel={panel}
              renaming={renaming}
              selectedQuestionId={selectedEnding ? "" : selectedQuestionId}
              selectedEndingId={selectedEndingId}
              showTranslationTip={showTranslationTip}
              onPanel={setPanel}
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
                if (survey.thankYouCards.length < 2) {
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
            />
          </s-box>
        )}

        {workspace === "logic" ? (
          <s-box
            padding="large"
            background="subdued"
            borderRadius="base"
            minBlockSize="720px"
          >
            <s-stack gap="small-200">
              <s-heading>Advanced logic</s-heading>
              <s-paragraph color="subdued">
                Branching rules for this survey will be edited on this canvas.
                Advanced logic is {survey.advancedLogicEnabled ? "on" : "off"}.
              </s-paragraph>
            </s-stack>
          </s-box>
        ) : (
          <EditorPreview
            question={selectedEnding ? null : selectedQuestion}
            device={device}
            ending={selectedEnding}
          />
        )}

        {device === "fullscreen" ? null : (
          <s-box inlineSize="300px" overflow="hidden">
            <EditorInspector
              question={selectedEnding ? null : selectedQuestion}
              ending={selectedEnding}
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
            />
          </s-box>
        )}
      </s-grid>
    </s-stack>
  );
}
