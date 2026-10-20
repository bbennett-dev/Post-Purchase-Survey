import { CHANNEL_DEFINITIONS, CHANNEL_LABELS } from "./channels";
import { isSurveyChannelEnabled } from "./runtime-channels";
import type { SurveyDocument } from "./types";

export interface SurveyListChannel {
  key: string;
  label: string;
}

/** Enabled channels for the surveys index (catalog order + labels from survey JSON). */
export function enabledChannelsForSurveyList(
  document: SurveyDocument,
): SurveyListChannel[] {
  return CHANNEL_DEFINITIONS.filter((definition) =>
    isSurveyChannelEnabled(document, definition.key),
  ).map((definition) => ({
    key: definition.key,
    label: CHANNEL_LABELS[definition.key] ?? definition.label,
  }));
}
