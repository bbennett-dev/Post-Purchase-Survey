import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canAutoAdvanceStep,
  emptySurveyAnswerDraft,
  sortedSurveyQuestions,
  validateQuestionStep,
  type SurveyAnswerDraft,
} from "../../../lib/survey/preview-survey-flow";
import type { SurveyQuestion, ThankYouContent } from "../../../lib/survey/types";
import type {
  EditorPreviewNavigateTarget,
  EditorPreviewSelection,
} from "./types";

export type SurveyPreviewPhase = "questions" | "thank_you";

export interface UseInteractiveSurveyPreviewResult {
  phase: SurveyPreviewPhase;
  question: SurveyQuestion | null;
  questionIndex: number;
  questionCount: number;
  draft: SurveyAnswerDraft;
  errorMessage: string;
  isLastQuestion: boolean;
  canGoBack: boolean;
  setDraft: (draft: SurveyAnswerDraft) => void;
  goNext: () => void;
  goBack: () => void;
  reset: () => void;
  thankYou: ThankYouContent;
}

/**
 * Multi-step survey runner for the editor preview (aligned with checkout flow).
 * `selection` keeps the canvas in sync with the left question / ending list.
 */
export function useInteractiveSurveyPreview(
  questions: SurveyQuestion[],
  thankYou: ThankYouContent,
  selection: EditorPreviewSelection,
  onPreviewNavigate?: (target: EditorPreviewNavigateTarget) => void,
): UseInteractiveSurveyPreviewResult {
  const sorted = useMemo(() => sortedSurveyQuestions(questions), [questions]);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<SurveyPreviewPhase>("questions");
  const [draftsByQuestionId, setDraftsByQuestionId] = useState<
    Record<string, SurveyAnswerDraft>
  >({});
  const [errorMessage, setErrorMessage] = useState("");

  const selectionKey =
    selection.type === "question"
      ? `q:${selection.questionId}`
      : `e:${selection.endingId ?? "default"}`;

  useEffect(() => {
    if (selection.type === "ending") {
      setPhase("thank_you");
      setErrorMessage("");
      return;
    }
    const index = sorted.findIndex(
      (item) => item.id === selection.questionId,
    );
    if (index >= 0) {
      setPhase("questions");
      setStepIndex(index);
      setErrorMessage("");
    }
  }, [selectionKey, selection, sorted]);

  const question =
    phase === "questions" ? (sorted[stepIndex] ?? null) : null;
  const draft = question
    ? (draftsByQuestionId[question.id] ?? emptySurveyAnswerDraft())
    : emptySurveyAnswerDraft();

  const advanceFromDraft = useCallback(
    (nextDraft: SurveyAnswerDraft) => {
      if (!question || !canAutoAdvanceStep(question, nextDraft)) {
        return;
      }
      setErrorMessage("");
      if (stepIndex >= sorted.length - 1) {
        setPhase("thank_you");
        onPreviewNavigate?.({
          type: "ending",
          endingId: thankYou.id ?? null,
        });
        return;
      }
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      const nextQuestion = sorted[nextIndex];
      if (nextQuestion) {
        onPreviewNavigate?.({ type: "question", questionId: nextQuestion.id });
      }
    },
    [onPreviewNavigate, question, sorted, stepIndex, thankYou.id],
  );

  const setDraft = useCallback(
    (nextDraft: SurveyAnswerDraft) => {
      if (!question) {
        return;
      }
      setDraftsByQuestionId((current) => {
        const nextDrafts = {
          ...current,
          [question.id]: nextDraft,
        };
        advanceFromDraft(nextDraft);
        return nextDrafts;
      });
      setErrorMessage("");
    },
    [advanceFromDraft, question],
  );

  const reset = useCallback(() => {
    setStepIndex(0);
    setPhase("questions");
    setDraftsByQuestionId({});
    setErrorMessage("");
    const firstId = sorted[0]?.id;
    if (firstId) {
      onPreviewNavigate?.({ type: "question", questionId: firstId });
    }
  }, [onPreviewNavigate, sorted]);

  const goBack = useCallback(() => {
    setErrorMessage("");
    if (phase === "thank_you") {
      setPhase("questions");
      const lastIndex = Math.max(0, sorted.length - 1);
      setStepIndex(lastIndex);
      const lastQuestion = sorted[lastIndex];
      if (lastQuestion) {
        onPreviewNavigate?.({ type: "question", questionId: lastQuestion.id });
      }
      return;
    }
    if (stepIndex > 0) {
      const prevIndex = stepIndex - 1;
      setStepIndex(prevIndex);
      const prevQuestion = sorted[prevIndex];
      if (prevQuestion) {
        onPreviewNavigate?.({ type: "question", questionId: prevQuestion.id });
      }
    }
  }, [onPreviewNavigate, phase, sorted, stepIndex]);

  const goNext = useCallback(() => {
    if (phase === "thank_you") {
      return;
    }
    if (!question) {
      if (sorted.length === 0) {
        setPhase("thank_you");
        onPreviewNavigate?.({
          type: "ending",
          endingId: thankYou.id ?? null,
        });
      }
      return;
    }
    if (!validateQuestionStep(question, draft)) {
      setErrorMessage("Answer this question first.");
      return;
    }
    setErrorMessage("");
    if (stepIndex >= sorted.length - 1) {
      setPhase("thank_you");
      onPreviewNavigate?.({
        type: "ending",
        endingId: thankYou.id ?? null,
      });
      return;
    }
    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    const nextQuestion = sorted[nextIndex];
    if (nextQuestion) {
      onPreviewNavigate?.({ type: "question", questionId: nextQuestion.id });
    }
  }, [
    draft,
    onPreviewNavigate,
    phase,
    question,
    sorted,
    stepIndex,
    thankYou.id,
  ]);

  const isLastQuestion =
    phase === "questions" &&
    sorted.length > 0 &&
    stepIndex >= sorted.length - 1;

  const canGoBack = phase === "thank_you" || stepIndex > 0;

  return {
    phase,
    question,
    questionIndex: stepIndex,
    questionCount: sorted.length,
    draft,
    errorMessage,
    isLastQuestion,
    canGoBack,
    setDraft,
    goNext,
    goBack,
    reset,
    thankYou,
  };
}
