/** Default face when nothing is hovered or selected (competitor “nope” / neutral). */
export const NUMBER_SCALE_DEFAULT_EMOJI = "😑";

const EMOJI_BY_BUCKET = ["😠", "☹️", "😑", "🙂", "😍"] as const;

/** Map 1–10 to anger → heart-eyes buckets (pairs per competitor). */
export function emojiForNumberScaleValue(value: number): string {
  if (!Number.isFinite(value)) {
    return NUMBER_SCALE_DEFAULT_EMOJI;
  }
  const clamped = Math.min(10, Math.max(1, Math.round(value)));
  const bucket = Math.floor((clamped - 1) / 2);
  return EMOJI_BY_BUCKET[bucket] ?? NUMBER_SCALE_DEFAULT_EMOJI;
}

export function parseNumberScaleAnswerContent(content: string): number | null {
  const parsed = Number.parseInt(content, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) {
    return null;
  }
  return parsed;
}
