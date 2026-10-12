import type {
  ChoiceAnswerLayout,
  SurveyQuestion,
} from "../../../../lib/survey/types";
import { QuestionImageSection } from "../../shared/QuestionImageSection";
import { fieldValue } from "../../field-value";
import { ChoiceAnswerListEditor } from "./ChoiceAnswerListEditor";
import { CustomAnswerSection } from "./CustomAnswerSection";
import styles from "./single-choice-question-fields.module.css";

export interface SingleChoiceQuestionFieldsProps {
  question: SurveyQuestion;
  onQuestionChange: (patch: Partial<SurveyQuestion>) => void;
}

const defaultImage = (question: SurveyQuestion) =>
  question.image ?? {
    url: "",
    alignment: "center" as const,
    sizePercentage: 100,
  };

const ANSWER_LAYOUT_OPTIONS: { value: ChoiceAnswerLayout; label: string }[] = [
  { value: "text_only", label: "Text only" },
  { value: "text_with_image", label: "Text with image" },
];

/**
 * Right-panel fields specific to single-choice questions.
 */
export function SingleChoiceQuestionFields({
  question,
  onQuestionChange,
}: SingleChoiceQuestionFieldsProps) {
  const answers = question.answers ?? [];
  const answerLayout = question.answerLayout ?? "text_only";

  return (
    <s-stack gap="base">
      <QuestionImageSection
        menuId={`question-image-menu-${question.id}`}
        image={defaultImage(question)}
        onChange={(image) => onQuestionChange({ image })}
        showSize
      />

      <s-divider direction="inline" color="base" />

      <s-checkbox
        label="Allow customers to skip this question"
        checked={question.skippable}
        onChange={(event) =>
          onQuestionChange({
            skippable: Boolean(
              (event.currentTarget as HTMLElement & { checked?: boolean })
                .checked,
            ),
          })
        }
      />

      <s-divider direction="inline" color="base" />

      <s-grid
        gridTemplateColumns="minmax(0, 1fr) auto"
        gap="small-200"
        alignItems="center"
      >
        <s-text>Answer layout</s-text>
        <div className={styles.answerLayoutSelect}>
          <s-select
            label="Answer layout"
            labelAccessibilityVisibility="exclusive"
            value={answerLayout}
            onChange={(event) => {
              const next = fieldValue(event);
              if (
                next === "text_only" ||
                next === "text_with_image"
              ) {
                onQuestionChange({ answerLayout: next });
              }
            }}
          >
            {ANSWER_LAYOUT_OPTIONS.map((option) => (
              <s-option key={option.value} value={option.value}>
                {option.label}
              </s-option>
            ))}
          </s-select>
        </div>
      </s-grid>

      <s-divider direction="inline" color="base" />

      <ChoiceAnswerListEditor
        answers={answers}
        onChange={(next) => onQuestionChange({ answers: next })}
      />

      <s-checkbox
        label="Shuffle answers"
        checked={question.shuffleAnswer === true}
        onChange={(event) =>
          onQuestionChange({
            shuffleAnswer: Boolean(
              (event.currentTarget as HTMLElement & { checked?: boolean })
                .checked,
            ),
          })
        }
      />
      <s-text color="subdued">
        Randomize answer order for each user
      </s-text>

      <s-divider direction="inline" color="base" />

      <CustomAnswerSection
        question={question}
        answers={answers}
        onQuestionChange={onQuestionChange}
      />
    </s-stack>
  );
}
