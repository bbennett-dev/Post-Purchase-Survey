import type { QuestionType, SurveyDocument } from "../../../../lib/survey/types";
import styles from "../../question-drag.module.css";
import { EndingsList } from "./EndingsList";
import { QuestionList } from "./QuestionList";

export interface ContentPanelProps {
  survey: SurveyDocument;
  selectedQuestionId: string;
  selectedEndingId: string | null;
  showTranslationTip: boolean;
  onSelectQuestion: (id: string) => void;
  onSelectEnding: (id: string) => void;
  onDismissTranslation: () => void;
  onAddQuestion: (type: QuestionType) => void;
  onMoveQuestion: (id: string, direction: -1 | 1) => void;
  onReorderQuestion: (order: string[]) => void;
  onDeleteQuestion: (id: string) => void;
  onAddEnding: () => void;
  onSetMain: (id: string) => void;
  onDeleteEnding: (id: string) => void;
}

/**
 * Content tab: questions, best-practice tip, endings, optional translation tip.
 */
export function ContentPanel({
  survey,
  selectedQuestionId,
  selectedEndingId,
  showTranslationTip,
  onSelectQuestion,
  onSelectEnding,
  onDismissTranslation,
  onAddQuestion,
  onMoveQuestion,
  onReorderQuestion,
  onDeleteQuestion,
  onAddEnding,
  onSetMain,
  onDeleteEnding,
}: ContentPanelProps) {
  return (
    <s-stack gap="small-200">
      <s-text type="strong" color="subdued">
        Content
      </s-text>
      <QuestionList
        questions={survey.questions}
        selectedQuestionId={selectedQuestionId}
        onSelectQuestion={onSelectQuestion}
        onMoveQuestion={onMoveQuestion}
        onDeleteQuestion={onDeleteQuestion}
        onReorderQuestion={onReorderQuestion}
        onAddQuestion={onAddQuestion}
      />
      <s-grid
        gridTemplateColumns="auto minmax(0, 1fr)"
        gap="small-100"
        alignItems="center"
      >
        <s-icon type="lightbulb" color="subdued" size="small" />
        <span className={styles.tip}>
          Best practice: keep this survey to a few questions.
        </span>
      </s-grid>

      <s-divider direction="inline" color="base" />

      <s-text type="strong" color="subdued">
        Endings
      </s-text>
      <EndingsList
        cards={survey.thankYouCards}
        selectedEndingId={selectedEndingId}
        onSelectEnding={onSelectEnding}
        onAddEnding={onAddEnding}
        onSetMain={onSetMain}
        onDeleteEnding={onDeleteEnding}
      />

      {showTranslationTip ? (
        <s-banner
          heading="Surveys work better in the customer's language"
          tone="info"
          dismissible
          onDismiss={onDismissTranslation}
        >
          <s-paragraph>
            Translations for this survey are stored on the document.
          </s-paragraph>
        </s-banner>
      ) : null}
    </s-stack>
  );
}
