import { Banner, BlockStack, Box, Divider, Text } from "@shopify/polaris";
import { isV1EditorLimited } from "app/lib/v1-product";
import type {
  QuestionType,
  SurveyDocument,
} from "../../../../lib/survey/types";
import { SectionLabel } from "../SectionLabel";
import { BestPracticeTip } from "./BestPracticeTip";
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
    <BlockStack gap="0">
      <SectionLabel variant="content">Content</SectionLabel>
      <QuestionList
        questions={survey.questions}
        selectedQuestionId={selectedQuestionId}
        onSelectQuestion={onSelectQuestion}
        onMoveQuestion={onMoveQuestion}
        onDeleteQuestion={onDeleteQuestion}
        onReorderQuestion={onReorderQuestion}
        onAddQuestion={onAddQuestion}
      />
      <BestPracticeTip />

      <Box paddingBlockStart="100">
        <Divider />
      </Box>

      <SectionLabel variant="endings">Endings</SectionLabel>
      <EndingsList
        cards={survey.thankYouCards}
        selectedEndingId={selectedEndingId}
        onSelectEnding={onSelectEnding}
        onAddEnding={onAddEnding}
        onSetMain={onSetMain}
        onDeleteEnding={onDeleteEnding}
      />

      {showTranslationTip && !isV1EditorLimited() ? (
        <Box paddingBlockStart="400">
          <Banner
            title="Surveys work better in the customer's language"
            tone="info"
            onDismiss={onDismissTranslation}
          >
            <Text as="p">
              Translations for this survey are stored on the document.
            </Text>
          </Banner>
        </Box>
      ) : null}
    </BlockStack>
  );
}
