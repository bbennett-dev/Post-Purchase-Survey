import { BlockStack, Checkbox, Select, Text } from "@shopify/polaris";
import {
  DATE_QUESTION_FORMAT_OPTIONS,
  isoToLocalDate,
  normalizeDateQuestionFormat,
  startOfTodayLocal,
} from "../../../../../lib/survey/dateQuestion";
import { SurveyDatePickerField } from "./SurveyDatePickerField";

export interface DateAnswerSectionProps {
  dateFormat: string | undefined;
  minDate: string | undefined;
  maxDate: string | undefined;
  maxDateIsCurrentDay: boolean;
  onChange: (patch: {
    dateFormat?: string;
    minDate?: string;
    maxDate?: string;
    maxDateIsCurrentDay?: boolean;
  }) => void;
}

/** “Answer” block: format, min/max dates, current-day max toggle. */
export function DateAnswerSection({
  dateFormat,
  minDate,
  maxDate,
  maxDateIsCurrentDay,
  onChange,
}: DateAnswerSectionProps) {
  const format = normalizeDateQuestionFormat(dateFormat);

  const minDisableAfter = maxDateIsCurrentDay
    ? startOfTodayLocal()
    : isoToLocalDate(maxDate);

  const maxDisableBefore = isoToLocalDate(minDate);
  const maxDisableAfter = maxDateIsCurrentDay ? startOfTodayLocal() : undefined;

  return (
    <BlockStack gap="400">
      <Text as="p" fontWeight="semibold">
        Answer
      </Text>

      <Select
        label="Date format"
        options={DATE_QUESTION_FORMAT_OPTIONS}
        value={format}
        onChange={(next) => {
          if (
            next === "DD/MM/YYYY" ||
            next === "MM/DD/YYYY" ||
            next === "YYYY/MM/DD"
          ) {
            onChange({ dateFormat: next });
          }
        }}
      />

      <SurveyDatePickerField
        label="Minimum date"
        isoValue={minDate}
        dateFormat={format}
        disableDatesAfter={minDisableAfter}
        onChange={(iso) => onChange({ minDate: iso })}
      />

      <SurveyDatePickerField
        label="Maximum date"
        isoValue={maxDate}
        dateFormat={format}
        disabled={maxDateIsCurrentDay}
        disableDatesBefore={maxDisableBefore}
        disableDatesAfter={maxDisableAfter}
        onChange={(iso) => onChange({ maxDate: iso })}
      />

      <Checkbox
        label="Set current day as max date"
        checked={maxDateIsCurrentDay}
        onChange={(checked) =>
          onChange({
            maxDateIsCurrentDay: checked,
            ...(checked ? { maxDate: undefined } : {}),
          })
        }
      />
    </BlockStack>
  );
}
