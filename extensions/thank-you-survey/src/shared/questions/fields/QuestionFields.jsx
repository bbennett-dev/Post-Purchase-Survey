import {
  readCheckboxChecked,
  readTextFieldValue,
} from "../../lib/checkout-events.js";

export function QuestionFields({ question, draft, onDraftChange }) {
  if (question.type === "short_answer" || question.type === "email") {
    return (
      <s-text-field
        label={question.heading}
        labelAccessibilityVisibility="exclusive"
        name={`text-${question.id}`}
        value={draft.customText}
        placeholder={
          question.placeholder?.trim() ||
          (question.type === "email" ? "Enter email" : "Your answer")
        }
        onChange={(event) => {
          onDraftChange({
            ...draft,
            customText: readTextFieldValue(event),
          });
        }}
      />
    );
  }

  if (question.type === "date") {
    return (
      <s-text-field
        label={question.heading}
        labelAccessibilityVisibility="exclusive"
        name={`date-${question.id}`}
        value={draft.customText}
        placeholder={question.dateFormat || "YYYY-MM-DD"}
        onChange={(event) => {
          onDraftChange({
            ...draft,
            customText: readTextFieldValue(event),
          });
        }}
      />
    );
  }

  if (question.type === "consent_email") {
    return (
      <s-checkbox
        label={question.agreeDescriptionEmail?.trim() || "I agree"}
        name={`consent-${question.id}`}
        checked={draft.answerIds.includes("consent")}
        onChange={(event) => {
          onDraftChange({
            ...draft,
            answerIds: readCheckboxChecked(event) ? ["consent"] : [],
          });
        }}
      />
    );
  }

  return null;
}
