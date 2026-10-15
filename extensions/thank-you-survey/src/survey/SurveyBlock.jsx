import { useCallback, useMemo, useState } from "preact/hooks";
import { CheckoutSurveyFrame } from "../components/CheckoutSurveyFrame.jsx";
import { SurveyEnding } from "../components/SurveyEnding.jsx";
import { SurveyFormFooter } from "../components/SurveyFormFooter.jsx";
import { QuestionStep } from "../questions/QuestionStep.jsx";
import { sortedSurveyQuestions } from "./checkout-data.js";
import { buildAnswerRecord, emptyDraft } from "./draft.js";
import { submitSurveyResponse } from "./submit.js";
import { canAutoAdvanceStep } from "./auto-advance.js";
import { resolveSurveyThankYou } from "./thank-you.js";
import { validateQuestionStep } from "./validate.js";

export function SurveyBlock({
  survey,
  orderId,
  submitUrl,
  pageType,
  channelType,
}) {
  const questions = useMemo(() => sortedSurveyQuestions(survey), [survey]);
  const thankYouEnding = useMemo(() => resolveSurveyThankYou(survey), [survey]);
  const [stepIndex, setStepIndex] = useState(0);
  const [draftsByQuestionId, setDraftsByQuestionId] = useState({});
  const [phase, setPhase] = useState("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const question = questions[stepIndex] ?? null;
  const draft = question
    ? (draftsByQuestionId[question.id] ?? emptyDraft())
    : emptyDraft();

  const goSubmit = useCallback(
    async (draftsOverride) => {
      if (!survey || !submitUrl || !orderId) {
        setErrorMessage(
          shopify.i18n.translate("submitUnavailable") ||
            "Unable to submit right now.",
        );
        return;
      }

      const drafts = draftsOverride ?? draftsByQuestionId;
      const answers = questions.map((q) => {
        const d = drafts[q.id] ?? emptyDraft();
        return buildAnswerRecord(q, d);
      });

      setSubmitting(true);
      setErrorMessage("");
      try {
        await submitSurveyResponse({
          submitUrl,
          orderId,
          survey,
          answers,
          pageType,
          channelType,
        });
        setPhase("success");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Submit failed",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      draftsByQuestionId,
      orderId,
      pageType,
      questions,
      channelType,
      submitUrl,
      survey,
    ],
  );

  const advanceAfterAnswer = useCallback(
    (activeQuestion, nextDraft, draftsOverride) => {
      if (submitting || !canAutoAdvanceStep(activeQuestion, nextDraft)) {
        return;
      }
      setErrorMessage("");
      if (stepIndex >= questions.length - 1) {
        void goSubmit(draftsOverride);
      } else {
        setStepIndex((i) => i + 1);
      }
    },
    [goSubmit, questions.length, stepIndex, submitting],
  );

  const setDraftForQuestion = useCallback(
    (questionId, nextDraft) => {
      setDraftsByQuestionId((current) => {
        const nextDrafts = {
          ...current,
          [questionId]: nextDraft,
        };
        if (question && question.id === questionId) {
          advanceAfterAnswer(question, nextDraft, nextDrafts);
        }
        return nextDrafts;
      });
      setErrorMessage("");
    },
    [advanceAfterAnswer, question],
  );

  const isLastStep = stepIndex >= questions.length - 1;

  const onPrimaryAction = useCallback(
    async (event) => {
      event.preventDefault();
      if (!validateQuestionStep(question, draft)) {
        setErrorMessage(
          shopify.i18n.translate("pickAnswer") || "Answer this question first.",
        );
        return;
      }
      setErrorMessage("");
      if (isLastStep) {
        await goSubmit();
      } else {
        setStepIndex((i) => i + 1);
      }
    },
    [draft, goSubmit, isLastStep, question],
  );

  if (!survey) {
    return null;
  }

  if (questions.length === 0) {
    return (
      <s-section heading={survey.name || shopify.i18n.translate("surveyHeading")}>
        <s-text>{shopify.i18n.translate("emptySurvey")}</s-text>
      </s-section>
    );
  }

  if (phase === "success") {
    return (
      <CheckoutSurveyFrame>
        <SurveyEnding thankYou={thankYouEnding} surveyName={survey.name} />
      </CheckoutSurveyFrame>
    );
  }

  const progressLabel = `${stepIndex + 1} of ${questions.length}`;
  const progressValue =
    questions.length > 0 ? (stepIndex + 1) / questions.length : 0;

  return (
    <CheckoutSurveyFrame>
      <s-form onSubmit={onPrimaryAction}>
        <s-stack gap="base">
          <s-stack gap="small">
            <s-text color="subdued">{progressLabel}</s-text>
            <s-progress value={progressValue} max={1} />
          </s-stack>

          <QuestionStep
            question={question}
            draft={draft}
            onDraftChange={(next) => setDraftForQuestion(question.id, next)}
          />

          {errorMessage ? (
            <s-text tone="critical">{errorMessage}</s-text>
          ) : null}

          <SurveyFormFooter
            stepIndex={stepIndex}
            isLastStep={isLastStep}
            submitting={submitting}
            onBack={() => {
              setErrorMessage("");
              setStepIndex((i) => Math.max(0, i - 1));
            }}
          />
        </s-stack>
      </s-form>
    </CheckoutSurveyFrame>
  );
}
