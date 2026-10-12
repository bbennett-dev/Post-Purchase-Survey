import type {
  PostPurchasePageChannel,
  SurveyDocument,
  SurveyQuestion,
} from "./types";

/**
 * Compact payload written to the $app:survey metaobject and checkout metafield.
 * Omits draft-only editor fields so JSON stays under the 128KB metafield limit.
 */
export interface PublishedSurveyPayload {
  id: string;
  name: string;
  questions: SurveyQuestion[];
  channels: {
    postPurchasePage?: PostPurchasePageChannel;
  };
}

/** Handle used for metaobjectUpsert; falls back when the survey has no id yet. */
export function surveyPublishHandle(survey: SurveyDocument): string {
  if (survey.id && survey.id.trim().length > 0) {
    return survey.id;
  }
  return `survey_${survey.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

/**
 * Builds the storefront/checkout render payload from a full survey document.
 */
export function buildPublishedSurveyPayload(
  survey: SurveyDocument,
): PublishedSurveyPayload {
  const handle = surveyPublishHandle(survey);
  const postPurchase = survey.channels.postPurchasePage as
    | PostPurchasePageChannel
    | undefined;

  return {
    id: handle,
    name: survey.name,
    questions: survey.questions,
    channels: {
      postPurchasePage: postPurchase?.enabled
        ? {
            type: "postPurchasePage",
            enabled: true,
            displayType: postPurchase.displayType,
            announcementBar: postPurchase.announcementBar,
            userTargeting: postPurchase.userTargeting,
            widgetRecurrence: postPurchase.widgetRecurrence,
          }
        : undefined,
    },
  };
}

/**
 * Rebuilds the shop channel_index metafield from every survey that has
 * at least one channel enabled. Call with all surveys for the shop on Save.
 */
export function buildChannelIndex(
  surveys: SurveyDocument[],
): Record<string, string[]> {
  const index: Record<string, string[]> = {};

  for (const survey of surveys) {
    const handle = surveyPublishHandle(survey);
    for (const [channelKey, channel] of Object.entries(survey.channels)) {
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
 * Surveys enabled for Thank you / Order status, keyed by handle.
 * Written to the shop checkout_surveys metafield for extension targets.
 */
export function buildCheckoutSurveys(
  surveys: SurveyDocument[],
): Record<string, PublishedSurveyPayload> {
  const checkout: Record<string, PublishedSurveyPayload> = {};

  for (const survey of surveys) {
    if (survey.channels.postPurchasePage?.enabled !== true) {
      continue;
    }
    const payload = buildPublishedSurveyPayload(survey);
    checkout[payload.id] = payload;
  }

  return checkout;
}
