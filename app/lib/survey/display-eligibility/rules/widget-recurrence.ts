import type { SurveyChannelDisplayRules } from "../../types";

export type WidgetRecurrenceMode = "once_per_customer" | "every_order";

export function widgetRecurrenceMode(
  rules: SurveyChannelDisplayRules | undefined,
): WidgetRecurrenceMode {
  return rules?.widgetRecurrence === "every_order"
    ? "every_order"
    : "once_per_customer";
}

/**
 * Whether the survey widget may show again for this buyer (channel recurrence setting).
 */
export function passesWidgetRecurrence(
  rules: SurveyChannelDisplayRules | undefined,
  hasPriorResponse: boolean,
): boolean {
  if (widgetRecurrenceMode(rules) === "every_order") {
    return true;
  }
  return !hasPriorResponse;
}
