/**
 * Shared survey UI for Thank you and Order status targets.
 * Multi-question flow: one step per question, single submit at the end.
 */

import { useCallback, useMemo, useState } from "preact/hooks";
import { CHECKOUT_CHANNEL_KEY } from "./channel-config.js";

const CONFIG_KEY = "__config";

const CHOICE_TYPES = new Set(["single", "multiple"]);
const SCALE_TYPES = new Set([
  "number_scale",
  "star_rating",
  "satisfaction",
]);

export function readCheckoutSurveys(entries) {
  const entry = (entries ?? []).find(
    (item) =>
      item?.metafield?.key === "checkout_surveys" &&
      (item?.target?.type === "shop" || item?.target?.type == null),
  );
  const raw = entry?.metafield?.value;
  if (!raw) {
    return null;
  }
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export function readCheckoutConfig(surveys) {
  if (!surveys || typeof surveys !== "object") {
    return null;
  }
  return surveys[CONFIG_KEY] ?? null;
}

function listSurveyPayloads(surveys) {
  if (!surveys || typeof surveys !== "object") {
    return [];
  }
  return Object.values(surveys).filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.id &&
      item.questions &&
      item !== surveys[CONFIG_KEY],
  );
}

/** First published survey that includes `channelKey` in its payload channels map. */
export function firstSurveyForChannel(surveys, channelKey) {
  const values = listSurveyPayloads(surveys);
  return values.find((item) => item?.channels?.[channelKey]) ?? null;
}

/** @deprecated use firstSurveyForChannel(surveys, CHECKOUT_CHANNEL_KEY) */
export function firstSurvey(surveys) {
  return firstSurveyForChannel(surveys, CHECKOUT_CHANNEL_KEY);
}

function channelDisplayType(survey, channelKey) {
  return survey?.channels?.[channelKey]?.displayType ?? null;
}

export function sortedSurveyQuestions(survey) {
  const list = survey?.questions ?? [];
  return [...list].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );
}

function emptyDraft() {
  return { answerIds: [], customText: "" };
}

function isOtherAnswer(answer) {
  return answer?.content?.toLowerCase() === "other";
}

/** Scale questions store endpoints only — synthesize selectable options for checkout. */
function choiceAnswersForQuestion(question) {
  if (question.answers?.length) {
    return question.answers;
  }
  if (!question?.id || !SCALE_TYPES.has(question.type)) {
    return [];
  }
  if (question.type === "number_scale") {
    return Array.from({ length: 11 }, (_, value) => ({
      id: `${question.id}_scale_${value}`,
      content: String(value),
    }));
  }
  if (question.type === "star_rating" || question.type === "satisfaction") {
    return Array.from({ length: 5 }, (_, index) => {
      const value = index + 1;
      return {
        id: `${question.id}_scale_${value}`,
        content: String(value),
      };
    });
  }
  return [];
}

function buildAnswerRecord(question, draft) {
  const labels = choiceAnswersForQuestion(question)
    .filter((a) => draft.answerIds.includes(a.id))
    .map((a) => a.content);

  return {
    questionId: question.id,
    questionType: question.type,
    questionHeading: question.heading,
    answerIds: [...draft.answerIds],
    answerLabels: labels,
    customText: draft.customText?.trim() || null,
  };
}

function validateQuestionStep(question, draft) {
  if (!question) {
    return false;
  }
  if (CHOICE_TYPES.has(question.type) || SCALE_TYPES.has(question.type)) {
    if (draft.answerIds.length === 0) {
      return false;
    }
    if (question.type === "single") {
      const selected = choiceAnswersForQuestion(question).find(
        (a) => a.id === draft.answerIds[0],
      );
      if (
        isOtherAnswer(selected) &&
        question.enabledCustomAnswer !== false &&
        !draft.customText?.trim()
      ) {
        return false;
      }
    }
    return true;
  }
  return draft.answerIds.length > 0 || Boolean(draft.customText?.trim());
}

async function submitSurveyResponse({
  submitUrl,
  orderId,
  survey,
  answers,
  pageType,
  channelType,
  displayType,
}) {
  const token = await shopify.sessionToken.get();
  const response = await fetch(submitUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      surveyId: survey.id,
      surveyName: survey.name,
      surveyType: survey.surveyType ?? "survey",
      answers,
      pageType,
      channelType: channelType ?? CHECKOUT_CHANNEL_KEY,
      displayType:
        displayType ?? channelDisplayType(survey, channelType ?? CHECKOUT_CHANNEL_KEY),
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Submit failed");
  }
}

function QuestionStep({ question, draft, onDraftChange }) {
  if (!question) {
    return null;
  }

  const answers = choiceAnswersForQuestion(question);

  const showOtherField =
    question.type === "single" &&
    answers.some(
      (a) => draft.answerIds[0] === a.id && isOtherAnswer(a),
    ) &&
    question.enabledCustomAnswer !== false;

  const showScaleHints =
    SCALE_TYPES.has(question.type) &&
    (question.leftLabel || question.rightLabel);

  return (
    <s-stack gap="base">
      <s-text type="strong">{question.heading}</s-text>
      {question.description ? (
        <s-text color="subdued">{question.description}</s-text>
      ) : null}

      {showScaleHints ? (
        <s-stack direction="inline" gap="base">
          {question.leftLabel ? (
            <s-text color="subdued">{question.leftLabel}</s-text>
          ) : null}
          {question.rightLabel ? (
            <s-text color="subdued">{question.rightLabel}</s-text>
          ) : null}
        </s-stack>
      ) : null}

      {question.type === "multiple" && answers.length ? (
        <s-choice-list
          name={`survey-q-${question.id}`}
          label={question.heading}
          labelAccessibilityVisibility="exclusive"
          multiple
          onChange={(event) => {
            const values = event.currentTarget?.values ?? [];
            onDraftChange({
              ...draft,
              answerIds: values.map(String),
            });
          }}
        >
          {answers.map((answer) => (
            <s-choice
              key={answer.id}
              value={answer.id}
              selected={draft.answerIds.includes(answer.id)}
            >
              {answer.content}
            </s-choice>
          ))}
        </s-choice-list>
      ) : null}

      {(question.type === "single" || SCALE_TYPES.has(question.type)) &&
      answers.length ? (
        <s-choice-list
          name={`survey-q-${question.id}`}
          label={question.heading}
          labelAccessibilityVisibility="exclusive"
          onChange={(event) => {
            /** Checkout `s-choice-list` exposes `values: string[]`, not `value`. */
            const values = event.currentTarget?.values ?? [];
            const nextId = values[0] ? String(values[0]) : "";
            onDraftChange({
              ...draft,
              answerIds: nextId ? [nextId] : [],
            });
          }}
        >
          {answers.map((answer) => (
            <s-choice
              key={answer.id}
              value={answer.id}
              selected={draft.answerIds[0] === answer.id}
            >
              {answer.content}
            </s-choice>
          ))}
        </s-choice-list>
      ) : null}

      {showOtherField ? (
        <s-text-field
          label={shopify.i18n.translate("otherLabel") || "Tell us more"}
          name={`other-${question.id}`}
          value={draft.customText}
          onChange={(event) => {
            onDraftChange({
              ...draft,
              customText: event.currentTarget?.value ?? "",
            });
          }}
        />
      ) : null}
    </s-stack>
  );
}

export function SurveyBlock({
  survey,
  orderId,
  submitUrl,
  pageType,
  channelType,
}) {
  const resolvedChannel = channelType ?? CHECKOUT_CHANNEL_KEY;
  const questions = useMemo(() => sortedSurveyQuestions(survey), [survey]);
  const [stepIndex, setStepIndex] = useState(0);
  const [draftsByQuestionId, setDraftsByQuestionId] = useState({});
  const [phase, setPhase] = useState("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const question = questions[stepIndex] ?? null;
  const draft = question
    ? (draftsByQuestionId[question.id] ?? emptyDraft())
    : emptyDraft();

  const setDraftForQuestion = useCallback((questionId, nextDraft) => {
    setDraftsByQuestionId((current) => ({
      ...current,
      [questionId]: nextDraft,
    }));
    setErrorMessage("");
  }, []);

  const isLastStep = stepIndex >= questions.length - 1;

  const goSubmit = useCallback(async () => {
    if (!survey || !submitUrl || !orderId) {
      setErrorMessage(
        shopify.i18n.translate("submitUnavailable") ||
          "Unable to submit right now.",
      );
      return;
    }

    const answers = questions.map((q) => {
      const d = draftsByQuestionId[q.id] ?? emptyDraft();
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
        channelType: resolvedChannel,
        displayType: channelDisplayType(survey, resolvedChannel),
      });
      setPhase("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Submit failed",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    draftsByQuestionId,
    orderId,
    pageType,
    questions,
    resolvedChannel,
    submitUrl,
    survey,
  ]);

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
      <s-section heading={survey.name || shopify.i18n.translate("surveyHeading")}>
        <s-stack gap="base">
          <s-text>
            {shopify.i18n.translate("thankYouSubmit") ||
              "Thanks — your answers were recorded."}
          </s-text>
        </s-stack>
      </s-section>
    );
  }

  const progressLabel = `${stepIndex + 1} / ${questions.length}`;

  return (
    <s-section heading={survey.name || shopify.i18n.translate("surveyHeading")}>
      <s-form onSubmit={onPrimaryAction}>
        <s-stack gap="base">
          <s-text color="subdued">{progressLabel}</s-text>
          <QuestionStep
            question={question}
            draft={draft}
            onDraftChange={(next) => setDraftForQuestion(question.id, next)}
          />
          {errorMessage ? (
            <s-text tone="critical">{errorMessage}</s-text>
          ) : null}
          <s-stack direction="inline" gap="base">
            {stepIndex > 0 ? (
              <s-button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setErrorMessage("");
                  setStepIndex((i) => Math.max(0, i - 1));
                }}
              >
                {shopify.i18n.translate("back") || "Back"}
              </s-button>
            ) : null}
            <s-button type="submit" disabled={submitting} loading={submitting}>
              {isLastStep
                ? shopify.i18n.translate("submit") || "Submit"
                : shopify.i18n.translate("next") || "Next"}
            </s-button>
          </s-stack>
        </s-stack>
      </s-form>
    </s-section>
  );
}
