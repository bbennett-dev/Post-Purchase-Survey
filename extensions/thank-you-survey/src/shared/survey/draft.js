import { CHOICE_TYPES, SCALE_TYPES } from "./constants.js";
import { choiceAnswersForQuestion } from "./question-answers.js";

export function emptyDraft() {
  return { answerIds: [], customText: "" };
}

function parseScaleNumber(label) {
  const parsed = Number.parseInt(String(label), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildAnswerRecord(question, draft) {
  const base = {
    questionId: question.id,
    questionType: question.type,
    questionHeading: question.heading,
  };

  if (question.type === "short_answer" || question.type === "email" || question.type === "date") {
    const text = draft.customText?.trim() || "";
    return {
      ...base,
      text,
      customText: text || null,
    };
  }

  if (question.type === "consent_email") {
    const consented = draft.answerIds.includes("consent");
    return {
      ...base,
      answerIds: consented ? ["consent"] : [],
      booleanAnswer: consented,
    };
  }

  if (question.type === "text_image") {
    return {
      ...base,
      booleanAnswer: Boolean(question.image?.url),
    };
  }

  const labels = choiceAnswersForQuestion(question)
    .filter((a) => draft.answerIds.includes(a.id))
    .map((a) => a.content);

  const record = {
    ...base,
    answerIds: [...draft.answerIds],
    answerLabels: labels,
    customText: draft.customText?.trim() || null,
  };

  if (CHOICE_TYPES.has(question.type) && question.type === "single") {
    const selected = choiceAnswersForQuestion(question).find(
      (a) => a.id === draft.answerIds[0],
    );
    if (selected && labels.length === 0 && draft.customText?.trim()) {
      record.answerLabels = [draft.customText.trim()];
    }
  }

  if (SCALE_TYPES.has(question.type) && labels.length === 1) {
    record.number = parseScaleNumber(labels[0]);
  }

  if (question.type === "multiple" && draft.customText?.trim()) {
    record.customText = draft.customText.trim();
  }

  return record;
}
