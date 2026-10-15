import {
  surveyHasAnyEnabledChannel,
  surveyHasCheckoutSurveysChannel,
} from "./runtime-channels";
import type { SurveyChannel, SurveyDocument, SurveyQuestion } from "./types";

/**
 * Compact payload written to the $app:survey metaobject and checkout metafield.
 * Omits draft-only editor fields so JSON stays under the 128KB metafield limit.
 */
export interface PublishedSurveyPayload {
  id: string;
  name: string;
  questions: SurveyQuestion[];
  channels: Record<string, SurveyChannel>;
}

/** Handle used for metaobjectUpsert; falls back when the survey has no id yet. */
export function surveyPublishHandle(survey: SurveyDocument): string {
  if (survey.id && survey.id.trim().length > 0) {
    return survey.id;
  }
  return `survey_${survey.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

function publishedChannelsFromDocument(
  survey: SurveyDocument,
): Record<string, SurveyChannel> {
  const channels: Record<string, SurveyChannel> = {};

  for (const [channelKey, channel] of Object.entries(survey.channels ?? {})) {
    if (channel?.enabled !== true) {
      continue;
    }
    channels[channelKey] = {
      ...channel,
      enabled: true,
      type: channel.type ?? channelKey,
    };
  }

  return channels;
}

/**
 * Builds the storefront/checkout render payload from a full survey document.
 * Only channels with `enabled: true` in the document are included.
 */
export function buildPublishedSurveyPayload(
  survey: SurveyDocument,
): PublishedSurveyPayload {
  return {
    id: surveyPublishHandle(survey),
    name: survey.name,
    questions: survey.questions,
    channels: publishedChannelsFromDocument(survey),
  };
}

/** @deprecated use surveyHasAnyEnabledChannel from runtime-channels */
export function surveyHasEnabledChannels(survey: SurveyDocument): boolean {
  return surveyHasAnyEnabledChannel(survey);
}

/**
 * Rebuilds the shop channel_index metafield from published (live) surveys.
 */
export function buildChannelIndex(
  surveys: SurveyDocument[],
): Record<string, string[]> {
  const index: Record<string, string[]> = {};

  for (const survey of surveys) {
    const handle = surveyPublishHandle(survey);
    for (const [channelKey, channel] of Object.entries(survey.channels ?? {})) {
      if (channel?.enabled !== true) {
        continue;
      }
      const list = index[channelKey] ?? [];
      if (!list.includes(handle)) {
        list.push(handle);
      }
      index[channelKey] = list;
    }
  }

  return index;
}

/**
 * Live surveys keyed by handle for `$app.checkout_surveys` (checkout UI extensions).
 * Only includes surveys with an enabled channel listed in CHECKOUT_SURVEYS_CHANNEL_KEYS.
 */
export function buildCheckoutSurveys(
  surveys: SurveyDocument[],
): Record<string, PublishedSurveyPayload> {
  const checkout: Record<string, PublishedSurveyPayload> = {};

  for (const survey of surveys) {
    if (!surveyHasCheckoutSurveysChannel(survey)) {
      continue;
    }
    const payload = buildPublishedSurveyPayload(survey);
    checkout[payload.id] = payload;
  }

  return checkout;
}
