import { CHECKOUT_CHANNEL_KEY } from "../channel-config.js";
import { CONFIG_KEY } from "./constants.js";

export function readCheckoutSurveys(entries) {
  const entry = (entries ?? []).find(
    (item) =>
      item?.metafield?.key === "checkout_surveys" &&
      (item?.target?.type === "shop" || item?.target?.type == null),
  );
  const raw = entry?.metafield?.value;
  if (!raw) {
    return null;
  }
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export function readCheckoutConfig(surveys) {
  if (!surveys || typeof surveys !== "object") {
    return null;
  }
  return surveys[CONFIG_KEY] ?? null;
}

function listSurveyPayloads(surveys) {
  if (!surveys || typeof surveys !== "object") {
    return [];
  }
  return Object.values(surveys).filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.id &&
      item.questions &&
      item !== surveys[CONFIG_KEY],
  );
}

export function firstSurveyForChannel(surveys, channelKey) {
  const values = listSurveyPayloads(surveys);
  return values.find((item) => item?.channels?.[channelKey]) ?? null;
}

/** @deprecated use firstSurveyForChannel(surveys, CHECKOUT_CHANNEL_KEY) */
export function firstSurvey(surveys) {
  return firstSurveyForChannel(surveys, CHECKOUT_CHANNEL_KEY);
}

export function sortedSurveyQuestions(survey) {
  const list = survey?.questions ?? [];
  return [...list].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );
}

export function channelDisplayType(survey, channelKey) {
  return survey?.channels?.[channelKey]?.displayType ?? null;
}
