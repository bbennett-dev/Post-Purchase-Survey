import { choiceAnswersForQuestion } from "./question-answers.js";

export function emptyDraft() {
  return { answerIds: [], customText: "" };
}

export function buildAnswerRecord(question, draft) {
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
