/** Keep in sync with `app/lib/survey/star-rating-ui.ts`. */

export const STAR_RATING_DEFAULT_EMOJI = "😑";

const EMOJI_BY_STAR = ["😠", "☹️", "😑", "🙂", "😍"];

export function emojiForStarRatingValue(value) {
  if (!Number.isFinite(value)) {
    return STAR_RATING_DEFAULT_EMOJI;
  }
  const clamped = Math.min(5, Math.max(1, Math.round(value)));
  return EMOJI_BY_STAR[clamped - 1] ?? STAR_RATING_DEFAULT_EMOJI;
}

export function parseStarRatingAnswerContent(content) {
  const parsed = Number.parseInt(String(content), 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }
  return parsed;
}
