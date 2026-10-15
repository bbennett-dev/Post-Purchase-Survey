import { readChoiceListValues, readTextFieldValue } from "../../lib/checkout-events.js";
import { isOtherAnswer } from "../../survey/question-answers.js";

function choiceListVariant(question) {
  if (question.type === "single" || question.type === "multiple") {
    return "block";
  }
  return "list";
}

export function ChoiceQuestion({ question, answers, draft, onDraftChange }) {
  const listVariant = choiceListVariant(question);

  const showOtherField =
    question.type === "single" &&
    answers.some(
      (a) => draft.answerIds[0] === a.id && isOtherAnswer(a),
    ) &&
    question.enabledCustomAnswer !== false;

  const selectSingle = (answerId) => {
    onDraftChange({ ...draft, answerIds: [answerId] });
  };

  return (
    <>
      {question.type === "multiple" && answers.length ? (
        <s-choice-list
          name={`survey-q-${question.id}`}
          label={question.heading}
          labelAccessibilityVisibility="exclusive"
          variant={listVariant}
          multiple
          onChange={(event) => {
            onDraftChange({
              ...draft,
              answerIds: readChoiceListValues(event),
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

      {question.type === "single" && answers.length ? (
        <s-choice-list
          name={`survey-q-${question.id}`}
          label={question.heading}
          labelAccessibilityVisibility="exclusive"
          variant={listVariant}
          onChange={(event) => {
            const values = readChoiceListValues(event);
            const nextId = values[0] ?? "";
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
          label={
            question.customAnswerPlaceholder?.trim() ||
            shopify.i18n.translate("otherLabel") ||
            "Tell us more"
          }
          name={`other-${question.id}`}
          value={draft.customText}
          onChange={(event) => {
            onDraftChange({
              ...draft,
              customText: readTextFieldValue(event),
            });
          }}
        />
      ) : null}
    </>
  );
}
