import { Badge, BlockStack, Link, Text } from "@shopify/polaris";
import type { SurveyResponseQuestionDto } from "../../lib/survey/response/survey-response.types";
import {
  maskedEmailAnswer,
  parseScaleNumericAnswer,
  satisfactionEmojiFromAnswer,
} from "../../lib/survey/response/response-list-formatters";
import styles from "./response-list-index-table.module.css";

/** Renders one question answer (list + detail tables). */
export function ResponseAnswerCell({
  question,
}: {
  question: SurveyResponseQuestionDto;
}) {
  const masked = maskedEmailAnswer(question);
  if (masked) {
    return <Badge>{masked}</Badge>;
  }

  if (question.type === "satisfaction") {
    const emoji = satisfactionEmojiFromAnswer(question);
    if (emoji) {
      return (
        <span className={styles.satisfactionEmoji} aria-hidden>
          {emoji}
        </span>
      );
    }
  }

  if (question.type === "number_scale") {
    const value = parseScaleNumericAnswer(question);
    if (value != null) {
      return <Badge tone="info">{`${value}/10`}</Badge>;
    }
  }

  if (question.type === "star_rating") {
    const value = parseScaleNumericAnswer(question);
    if (value != null) {
      return <Badge tone="warning">{`⭐ ${value}/5`}</Badge>;
    }
  }

  if (question.type === "upload" && question.image) {
    return (
      <Link url={question.image} external removeUnderline>
        {question.image}
      </Link>
    );
  }

  if (question.answers?.length) {
    return (
      <BlockStack gap="100" inlineAlign="start">
        {question.answers.map((label) => (
          <Badge key={`${question.questionId}-${label}`}>{label}</Badge>
        ))}
        {question.customAnswer ? (
          <Text as="span" variant="bodySm" tone="subdued">
            {question.customAnswer}
          </Text>
        ) : null}
      </BlockStack>
    );
  }

  const single =
    question.answer != null && question.answer !== ""
      ? String(question.answer)
      : question.customAnswer;

  if (!single) {
    return (
      <Text as="span" tone="subdued">
        —
      </Text>
    );
  }

  if (question.type === "single") {
    return (
      <BlockStack gap="100" inlineAlign="start">
        <Badge>{single}</Badge>
        {question.customAnswer && question.customAnswer !== single ? (
          <Text as="span" variant="bodySm" tone="subdued">
            {question.customAnswer}
          </Text>
        ) : null}
      </BlockStack>
    );
  }

  return (
    <Text as="span" variant="bodySm">
      {single}
    </Text>
  );
}
