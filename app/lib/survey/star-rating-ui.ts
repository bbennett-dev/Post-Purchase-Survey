/** Default when nothing is hovered or selected. */
export const STAR_RATING_DEFAULT_EMOJI = "😑";

const EMOJI_BY_STAR = ["😠", "☹️", "😑", "🙂", "😍"] as const;

/** One emoji per star (1–5), competitor parity. */
export function emojiForStarRatingValue(value: number): string {
  if (!Number.isFinite(value)) {
    return STAR_RATING_DEFAULT_EMOJI;
  }
  const clamped = Math.min(5, Math.max(1, Math.round(value)));
  return EMOJI_BY_STAR[clamped - 1] ?? STAR_RATING_DEFAULT_EMOJI;
}

export function parseStarRatingAnswerContent(content: string): number | null {
  const parsed = Number.parseInt(content, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }
  return parsed;
}
