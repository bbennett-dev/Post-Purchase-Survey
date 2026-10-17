/** Default ending card from published checkout payload (mirrors editor main ending). */
export function resolveSurveyThankYou(survey) {
  if (!survey || typeof survey !== "object") {
    return null;
  }
  if (survey.thankYou && typeof survey.thankYou === "object") {
    return survey.thankYou;
  }
  const cards = survey.thankYouCards;
  if (!Array.isArray(cards) || cards.length === 0) {
    return null;
  }
  return cards.find((card) => card?.isDefault) ?? cards[0] ?? null;
}

/** @param {Record<string, unknown> | null | undefined} thankYou */
export function thankYouButtonHref(thankYou) {
  if (!thankYou) {
    return null;
  }
  const raw = String(thankYou.buttonLink ?? thankYou.link ?? "").trim();
  if (!raw) {
    return null;
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return `https://${raw}`;
}
