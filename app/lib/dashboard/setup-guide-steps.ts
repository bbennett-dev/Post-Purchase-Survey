import type { DashboardSnapshot } from "./dashboard.server";

export const SETUP_GUIDE_STEP_IDS = [
  "enable-embed",
  "create-survey",
  "publish-live",
  "first-response",
] as const;

export type SetupGuideStepId = (typeof SETUP_GUIDE_STEP_IDS)[number];

export type SetupGuideAutoCompletion = Record<SetupGuideStepId, boolean>;

/** Server + client signals used to auto-check setup steps. */
export function buildSetupGuideAutoCompletion(
  snapshot: DashboardSnapshot,
  appEmbedOn: boolean,
): SetupGuideAutoCompletion {
  return {
    "enable-embed": appEmbedOn,
    "create-survey": snapshot.totalSurveys > 0,
    "publish-live": snapshot.liveSurveys > 0,
    "first-response": snapshot.totalResponses > 0,
  };
}
