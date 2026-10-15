import type { ReactNode } from "react";
import {
  BlockStack,
  Box,
  Button,
  Checkbox,
  InlineGrid,
  Icon,
  InlineStack,
  ProgressBar,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import { ArrowRightIcon, CheckIcon } from "@shopify/polaris-icons";
import {
  choiceAnswersForQuestion,
  isOtherAnswer,
  type SurveyAnswerDraft,
} from "../../../lib/survey/preview-survey-flow";
import type { ImageAlignment, SurveyQuestion, ThankYouContent } from "../../../lib/survey/types";
import { NumberScaleQuestion } from "./questions/number-scale/NumberScaleQuestion";
import { SatisfactionQuestion } from "./questions/satisfaction/SatisfactionQuestion";
import { StarRatingQuestion } from "./questions/star-rating/StarRatingQuestion";

const SCALE_TYPES = new Set<SurveyQuestion["type"]>([
  "number_scale",
  "star_rating",
  "satisfaction",
]);

interface SurveyPreviewStepProps {
  phase: "questions" | "thank_you";
  question: SurveyQuestion | null;
  thankYou: ThankYouContent;
  questionIndex: number;
  questionCount: number;
  draft: SurveyAnswerDraft;
  errorMessage: string;
  isLastQuestion: boolean;
  canGoBack: boolean;
  onDraftChange: (draft: SurveyAnswerDraft) => void;
  onBack: () => void;
  onNext: () => void;
}

export function SurveyPreviewStep({
  phase,
  question,
  thankYou,
  questionIndex,
  questionCount,
  draft,
  errorMessage,
  isLastQuestion,
  canGoBack,
  onDraftChange,
  onBack,
  onNext,
}: SurveyPreviewStepProps) {
  if (phase === "thank_you") {
    return (
      <CheckoutSurveyFrame>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            {thankYou.heading}
          </Text>
          {thankYou.description ? (
            <Text as="p" tone="subdued">{thankYou.description}</Text>
          ) : null}
          {thankYou.enableButton ? (
            <Button variant="primary">{thankYou.buttonText || "Continue"}</Button>
          ) : null}
          {canGoBack ? (
            <InlineStack align="end">
              <Button variant="plain" onClick={onBack}>Back</Button>
            </InlineStack>
          ) : null}
        </BlockStack>
      </CheckoutSurveyFrame>
    );
  }

  if (questionCount === 0) {
    return (
      <CheckoutSurveyFrame>
        <Text as="p" tone="subdued" alignment="center">
          Add questions to preview the survey flow.
        </Text>
      </CheckoutSurveyFrame>
    );
  }

  if (!question) {
    return null;
  }

  const answers = choiceAnswersForQuestion(question);
  const stepLabel = `${questionIndex + 1} of ${questionCount}`;
  const progress = ((questionIndex + 1) / questionCount) * 100;
  const showOtherField =
    question.type === "single" &&
    answers.some(
      (answer) => draft.answerIds[0] === answer.id && isOtherAnswer(answer),
    ) &&
    question.enabledCustomAnswer !== false;

  return (
    <CheckoutSurveyFrame>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <Text as="span" variant="bodySm" tone="subdued">
            {stepLabel}
          </Text>
          <ProgressBar progress={progress} size="small" tone="primary" />
        </BlockStack>

        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            {question.heading || "Untitled question"}
          </Text>
          {question.description ? (
            <Text as="p" tone="subdued">{question.description}</Text>
          ) : null}
        </BlockStack>

        {question.image?.url ? (
          <AlignedPreviewImage
            url={question.image.url}
            alignment={question.image.alignment ?? "center"}
            sizePercent={parseSizePercent(question.image.sizePercentage)}
          />
        ) : null}

        {question.type === "short_answer" || question.type === "email" ? (
          <TextField
            label={question.heading}
            labelHidden
            value={draft.customText}
            onChange={(value) =>
              onDraftChange({ ...draft, customText: value })
            }
            placeholder={
              question.placeholder?.trim() ||
              (question.type === "email" ? "Enter email" : "Your answer")
            }
            autoComplete="off"
          />
        ) : null}

        {question.type === "date" ? (
          <TextField
            label={question.heading}
            labelHidden
            value={draft.customText}
            onChange={(value) =>
              onDraftChange({ ...draft, customText: value })
            }
            placeholder={question.dateFormat || "YYYY-MM-DD"}
            autoComplete="off"
          />
        ) : null}

        {question.type === "text_image" && !question.image?.url ? (
          <Text as="p" tone="subdued">Add an image in the editor to preview this question.</Text>
        ) : null}

        {question.type === "consent_email" ? (
          <Checkbox
            label={
              question.agreeDescriptionEmail?.trim() || "I agree"
            }
            checked={draft.answerIds.includes("consent")}
            onChange={(checked) =>
              onDraftChange({
                ...draft,
                answerIds: checked ? ["consent"] : [],
              })
            }
          />
        ) : null}

        {question.type === "number_scale" ? (
          <NumberScaleQuestion
            question={question}
            selectedAnswerId={draft.answerIds[0]}
            onSelect={(answerId) =>
              onDraftChange({ ...draft, answerIds: [answerId] })
            }
          />
        ) : null}

        {question.type === "star_rating" ? (
          <StarRatingQuestion
            question={question}
            selectedAnswerId={draft.answerIds[0]}
            onSelect={(answerId) =>
              onDraftChange({ ...draft, answerIds: [answerId] })
            }
          />
        ) : null}

        {question.type === "satisfaction" ? (
          <SatisfactionQuestion
            question={question}
            selectedAnswerId={draft.answerIds[0]}
            onSelect={(answerId) =>
              onDraftChange({ ...draft, answerIds: [answerId] })
            }
          />
        ) : null}

        {answers.length > 0 &&
        (question.type === "single" || question.type === "multiple") ? (
          <BlockStack gap="200">
            {answers.map((answer) => {
              const selected =
                question.type === "multiple"
                  ? draft.answerIds.includes(answer.id)
                  : draft.answerIds[0] === answer.id;
              return (
                <ChoiceRow
                  key={answer.id}
                  selected={selected}
                  multiple={question.type === "multiple"}
                  label={answer.content || "Option"}
                  onSelect={() => {
                    if (question.type === "multiple") {
                      const nextIds = selected
                        ? draft.answerIds.filter((id) => id !== answer.id)
                        : [...draft.answerIds, answer.id];
                      onDraftChange({ ...draft, answerIds: nextIds });
                      return;
                    }
                    onDraftChange({
                      ...draft,
                      answerIds: [answer.id],
                    });
                  }}
                />
              );
            })}
          </BlockStack>
        ) : null}

        {showOtherField ? (
          <TextField
            label={question.customAnswerPlaceholder || "Tell us more"}
            value={draft.customText}
            onChange={(value) =>
              onDraftChange({ ...draft, customText: value })
            }
            autoComplete="off"
          />
        ) : null}

        {errorMessage ? (
          <Text as="p" tone="critical">{errorMessage}</Text>
        ) : null}

        <InlineGrid columns="1fr auto auto" gap="200" alignItems="center">
          <Text as="span" variant="bodySm" tone="subdued">
            sea
          </Text>
          {canGoBack ? (
            <Button variant="plain" onClick={onBack}>Back</Button>
          ) : (
            <span />
          )}
          <Button
            icon={isLastQuestion ? undefined : ArrowRightIcon}
            variant="primary"
            onClick={onNext}
          >
            {isLastQuestion ? "Submit" : "Next"}
          </Button>
        </InlineGrid>
      </BlockStack>
    </CheckoutSurveyFrame>
  );
}

function ChoiceRow({
  selected,
  multiple,
  label,
  onSelect,
}: {
  selected: boolean;
  multiple: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: "block",
        width: "100%",
        margin: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <Box
        padding="300"
        borderWidth="025"
        borderColor={selected ? "border-emphasis" : "border"}
        borderRadius="200"
        background={selected ? "bg-surface-hover" : "bg-surface"}
      >
        <InlineStack gap="200" blockAlign="center">
          <ChoiceControl selected={selected} multiple={multiple} />
          <Text as="span">{label}</Text>
        </InlineStack>
      </Box>
    </button>
  );
}

/** Round radio for single choice; square checkbox for multiple (matches checkout `s-choice-list`). */
function ChoiceControl({
  selected,
  multiple,
}: {
  selected: boolean;
  multiple: boolean;
}) {
  if (multiple) {
    return (
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          flexShrink: 0,
          borderRadius: 4,
          border: selected
            ? "2px solid var(--p-color-border-emphasis)"
            : "1px solid var(--p-color-border)",
          background: selected
            ? "var(--p-color-bg-fill-brand)"
            : "var(--p-color-bg-surface)",
          boxSizing: "border-box",
        }}
      >
        {selected ? (
          <span style={{ color: "var(--p-color-text-brand-on-bg-fill)" }}>
            <Icon source={CheckIcon} />
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        flexShrink: 0,
        borderRadius: "50%",
        border: selected
          ? "2px solid var(--p-color-border-emphasis)"
          : "1px solid var(--p-color-border)",
        background: "var(--p-color-bg-surface)",
        boxSizing: "border-box",
      }}
    >
      {selected ? (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--p-color-bg-fill-brand)",
          }}
        />
      ) : null}
    </span>
  );
}

function CheckoutSurveyFrame({ children }: { children: ReactNode }) {
  return (
    <Box
      background="bg-surface"
      borderRadius="300"
      borderWidth="025"
      borderColor="border"
      overflowX="hidden"
      overflowY="hidden"
      width="100%"
      maxWidth="480px"
    >
      <Box minHeight="4px" background="bg-fill-brand" width="100%" />
      <Box padding="500">{children}</Box>
    </Box>
  );
}

function AlignedPreviewImage({
  url,
  alignment,
  sizePercent,
}: {
  url: string;
  alignment: ImageAlignment;
  sizePercent: number;
}) {
  const align =
    alignment === "left" ? "start" : alignment === "right" ? "end" : "center";

  return (
    <InlineStack align={align}>
      <Box maxWidth={`${sizePercent}%`}>
        <Thumbnail source={url} alt="" size="large" />
      </Box>
    </InlineStack>
  );
}

function parseSizePercent(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isFinite(parsed)) {
    return Math.min(100, Math.max(0, parsed));
  }
  return 50;
}
