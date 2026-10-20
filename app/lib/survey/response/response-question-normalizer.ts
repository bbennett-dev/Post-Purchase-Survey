import { choiceAnswersForQuestion } from "../preview-survey-flow";
import { emojiForStarRatingValue } from "../star-rating-ui";
import type {
  SurveyResponseAnswerInput,
  SurveyResponseQuestionDto,
} from "./survey-response.types";
import type { SurveyDocument, SurveyQuestion } from "../types";

const SCALE_TYPES = new Set(["number_scale", "star_rating", "satisfaction"]);

function questionMapFromDocument(
  document: unknown,
): Map<string, SurveyQuestion> {
  const map = new Map<string, SurveyQuestion>();
  if (!document || typeof document !== "object") {
    return map;
  }
  const questions = (document as SurveyDocument).questions;
  if (!Array.isArray(questions)) {
    return map;
  }
  for (const q of questions) {
    if (q?.id) {
      map.set(q.id, q);
    }
  }
  return map;
}

function formatDateForDisplay(isoOrText: string): string {
  const trimmed = isoOrText.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat(undefined, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }).format(date);
    }
  }
  return trimmed;
}

function resolveScaleNumericValue(
  questionType: string,
  answer: SurveyResponseAnswerInput,
  question?: SurveyQuestion,
): number | null {
  if (typeof answer.number === "number" && !Number.isNaN(answer.number)) {
    return answer.number;
  }

  const label = answer.answerLabels?.[0];
  if (label) {
    const parsed = Number.parseInt(label, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (question && SCALE_TYPES.has(questionType)) {
    const selectedId = answer.answerIds?.[0];
    const option = choiceAnswersForQuestion(question).find(
      (a) => a.id === selectedId,
    );
    if (option) {
      const parsed = Number.parseInt(option.content, 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

/** Persist scale answers: numbers for star/scale; emoji only for satisfaction. */
function scaleStoredValue(
  questionType: string,
  answer: SurveyResponseAnswerInput,
  question?: SurveyQuestion,
): string | number {
  const numeric = resolveScaleNumericValue(questionType, answer, question);
  if (numeric == null) {
    return answer.answerLabels?.[0] ?? "";
  }
  if (questionType === "satisfaction") {
    return emojiForStarRatingValue(numeric);
  }
  if (questionType === "number_scale" || questionType === "star_rating") {
    return numeric;
  }
  return numeric;
}

/**
 * Maps checkout answer payloads to competitor-shaped `questions` JSON for storage.
 */
export function normalizeSurveyResponseQuestions(
  answers: SurveyResponseAnswerInput[],
  surveyDocument?: unknown,
): SurveyResponseQuestionDto[] {
  const byId = questionMapFromDocument(surveyDocument);

  return answers.map((answer, index) => {
    const questionType = String(answer.questionType);
    const questionDef = byId.get(answer.questionId);
    const heading =
      answer.questionHeading?.trim() ||
      questionDef?.heading?.trim() ||
      `Question ${index + 1}`;

    const base: SurveyResponseQuestionDto = {
      type: questionType,
      question: heading,
      questionId: answer.questionId,
    };

    if (questionType === "multiple") {
      const labels = answer.answerLabels ?? [];
      const ids = answer.answerIds ?? [];
      return {
        ...base,
        answers: labels,
        answerIds: ids,
        customAnswer: answer.customText?.trim() || null,
        images: labels.map(() => null),
      };
    }

    if (questionType === "single") {
      const label = answer.answerLabels?.[0] ?? answer.customText ?? "";
      const otherText = answer.customText?.trim();
      const display =
        otherText && answer.answerLabels?.length
          ? `${label}${otherText ? ` (${otherText})` : ""}`
          : label || otherText || "";
      return {
        ...base,
        answer: display,
        answerId: answer.answerIds?.[0] ?? null,
        image: answer.imageUrl ?? null,
      };
    }

    if (SCALE_TYPES.has(questionType)) {
      return {
        ...base,
        answer: scaleStoredValue(questionType, answer, questionDef),
      };
    }

    if (questionType === "date") {
      const raw = answer.text ?? answer.customText ?? "";
      return {
        ...base,
        answer: raw ? formatDateForDisplay(raw) : "",
        answerId: null,
        image: null,
      };
    }

    if (questionType === "upload") {
      const url = answer.text ?? answer.imageUrl ?? "";
      return {
        ...base,
        answer: url || null,
        answerId: null,
        image: null,
        fileName: null,
      };
    }

    if (questionType === "text_image") {
      return {
        ...base,
        answer: answer.booleanAnswer === true ? true : null,
        answerId: null,
        image: questionDef?.image?.url ?? null,
      };
    }

    if (questionType === "consent_email") {
      const consented = answer.answerIds?.includes("consent");
      return {
        ...base,
        answer: consented ? "true" : "false",
        answerId: null,
        image: null,
      };
    }

    const text =
      answer.text?.trim() ||
      answer.customText?.trim() ||
      answer.answerLabels?.join(", ") ||
      "";
    return {
      ...base,
      answer: text,
      answerId: answer.answerIds?.[0] ?? null,
      image: answer.imageUrl ?? null,
    };
  });
}
