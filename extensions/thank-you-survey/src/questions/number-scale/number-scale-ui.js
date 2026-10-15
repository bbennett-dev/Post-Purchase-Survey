/** Keep in sync with `app/lib/survey/number-scale-ui.ts`. */

export const NUMBER_SCALE_DEFAULT_EMOJI = "😑";

const EMOJI_BY_BUCKET = ["😠", "☹️", "😑", "🙂", "😍"];

export function emojiForNumberScaleValue(value) {
  if (!Number.isFinite(value)) {
    return NUMBER_SCALE_DEFAULT_EMOJI;
  }
  const clamped = Math.min(10, Math.max(1, Math.round(value)));
  const bucket = Math.floor((clamped - 1) / 2);
  return EMOJI_BY_BUCKET[bucket] ?? NUMBER_SCALE_DEFAULT_EMOJI;
}

export function parseNumberScaleAnswerContent(content) {
  const parsed = Number.parseInt(String(content), 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) {
    return null;
  }
  return parsed;
}
