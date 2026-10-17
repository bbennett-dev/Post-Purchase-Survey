import { QuestionHeader } from "../components/QuestionHeader.jsx";
import { choiceAnswersForQuestion } from "../survey/question-answers.js";
import { ChoiceQuestion } from "./choice/ChoiceQuestion.jsx";
import { QuestionFields } from "./fields/QuestionFields.jsx";
import { NumberScaleQuestion } from "./number-scale/NumberScaleQuestion.jsx";
import { SatisfactionQuestion } from "./satisfaction/SatisfactionQuestion.jsx";
import { StarRatingQuestion } from "./star-rating/StarRatingQuestion.jsx";

/**
 * Renders one survey question body (type-specific controls below shared header).
 */
export function QuestionStep({ question, draft, onDraftChange }) {
  if (!question) {
    return null;
  }

  const answers = choiceAnswersForQuestion(question);

  const selectAnswer = (answerId) => {
    onDraftChange({ ...draft, answerIds: [answerId] });
  };

  return (
    <s-stack gap="base">
      <QuestionHeader question={question} />

      <QuestionFields
        question={question}
        draft={draft}
        onDraftChange={onDraftChange}
      />

      {question.type === "number_scale" && answers.length ? (
        <NumberScaleQuestion
          question={question}
          answers={answers}
          selectedAnswerId={draft.answerIds[0]}
          onSelect={selectAnswer}
        />
      ) : null}

      {question.type === "star_rating" && answers.length ? (
        <StarRatingQuestion
          question={question}
          answers={answers}
          selectedAnswerId={draft.answerIds[0]}
          onSelect={selectAnswer}
        />
      ) : null}

      {question.type === "satisfaction" && answers.length ? (
        <SatisfactionQuestion
          question={question}
          answers={answers}
          selectedAnswerId={draft.answerIds[0]}
          onSelect={selectAnswer}
        />
      ) : null}

      {question.type === "single" || question.type === "multiple" ? (
        <ChoiceQuestion
          question={question}
          answers={answers}
          draft={draft}
          onDraftChange={onDraftChange}
        />
      ) : null}
    </s-stack>
  );
}
