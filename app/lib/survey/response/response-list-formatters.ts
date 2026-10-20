import { emojiForStarRatingValue } from "../star-rating-ui";
import type { SurveyResponseQuestionDto } from "./survey-response.types";
import type { SurveyResponseListItemDto } from "./response-api.mapper";

const ANSWER_TYPE_LABELS: Record<string, string> = {
  single: "Single choice",
  multiple: "Multiple choice",
  number_scale: "Number scale",
  star_rating: "Star rating",
  satisfaction: "Satisfaction",
  short: "Short answer",
  date: "Date",
  text_image: "Text image",
  consent_email: "Email",
  upload: "Upload",
};

/** Competitor-style answer type pill label. */
export function answerTypeLabel(type: string): string {
  return ANSWER_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

/** Short public id for list — last UUID segment (e.g. #A1B2C3D4E5F6). */
export function formatResponseDisplayId(dto: SurveyResponseListItemDto): string {
  const segments = dto.id.split("-");
  const last = segments[segments.length - 1] ?? dto.id.replace(/-/g, "");
  return `#${last.toUpperCase()}`;
}

/** Submitted timestamp under response id. */
export function formatResponseSubmittedAt(iso: string): string {
  const date = new Date(iso);
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "shortOffset",
  }).format(date);
  return formatted.replace(",", " at");
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return email;
  }
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

/** Plain-text answer for search; UI uses `ResponseAnswerCell`. */
export function answerSearchText(question: SurveyResponseQuestionDto): string {
  if (question.answers?.length) {
    return question.answers.join(" ");
  }
  if (question.answer != null && question.answer !== "") {
    return String(question.answer);
  }
  if (question.customAnswer) {
    return question.customAnswer;
  }
  if (question.image) {
    return question.image;
  }
  return "";
}

/** Parses stored scale value (number or legacy `"4 🙂"` strings). */
export function parseScaleNumericAnswer(
  question: SurveyResponseQuestionDto,
): number | null {
  if (typeof question.answer === "number" && Number.isFinite(question.answer)) {
    return question.answer;
  }
  if (typeof question.answer === "string") {
    const trimmed = question.answer.trim();
    const leading = trimmed.match(/^(\d+)/);
    if (leading) {
      const parsed = Number.parseInt(leading[1], 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

/** Satisfaction rows show emoji only (supports legacy numeric+emoji strings). */
export function satisfactionEmojiFromAnswer(
  question: SurveyResponseQuestionDto,
): string | null {
  if (question.type !== "satisfaction") {
    return null;
  }
  if (typeof question.answer === "string") {
    const trimmed = question.answer.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const legacy = trimmed.match(/^(\d+)\s+(.+)$/);
    if (legacy) {
      return legacy[2].trim();
    }
    if (!/^\d+$/.test(trimmed)) {
      return trimmed;
    }
  }
  const numeric = parseScaleNumericAnswer(question);
  if (numeric != null) {
    return emojiForStarRatingValue(numeric);
  }
  return null;
}

export function maskedEmailAnswer(
  question: SurveyResponseQuestionDto,
): string | null {
  const raw =
    typeof question.answer === "string"
      ? question.answer
      : question.customAnswer;
  if (!raw?.includes("@")) {
    return null;
  }
  return maskEmail(raw);
}
