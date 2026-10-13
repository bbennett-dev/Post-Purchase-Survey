import { useCallback, useEffect, useRef, useState } from "react";
import { DatePicker, Icon, Popover, TextField } from "@shopify/polaris";
import { CalendarIcon } from "@shopify/polaris-icons";
import {
  dateFormatPlaceholder,
  formatIsoForDisplay,
  isoToLocalDate,
  localDateToIso,
  normalizeDateQuestionFormat,
  pickerMonthYearFromIso,
  type DateQuestionFormat,
} from "../../../../../lib/survey/dateQuestion";
import { DateInputClearButton } from "./DateInputClearButton";
import styles from "./survey-date-picker.module.css";

export interface SurveyDatePickerFieldProps {
  label: string;
  isoValue: string | undefined;
  dateFormat: DateQuestionFormat;
  disabled?: boolean;
  disableDatesBefore?: Date;
  disableDatesAfter?: Date;
  onChange: (iso: string | undefined) => void;
}

/**
 * Competitor-style date field: calendar prefix, clear control, popover DatePicker with caret.
 * Polaris React Popover has no built-in pointer; see `popoverBeak` in the date picker CSS module.
 */
export function SurveyDatePickerField({
  label,
  isoValue,
  dateFormat,
  disabled = false,
  disableDatesBefore,
  disableDatesAfter,
  onChange,
}: SurveyDatePickerFieldProps) {
  const format = normalizeDateQuestionFormat(dateFormat);
  const [popoverActive, setPopoverActive] = useState(false);
  const skipFocusOpenRef = useRef(false);
  const [{ month, year }, setMonthYear] = useState(() =>
    pickerMonthYearFromIso(isoValue),
  );

  const selected = isoToLocalDate(isoValue);
  const displayValue = formatIsoForDisplay(isoValue, format);
  const hasValue = displayValue.length > 0;
  const placeholder = dateFormatPlaceholder(format);

  useEffect(() => {
    if (!popoverActive) {
      setMonthYear(pickerMonthYearFromIso(isoValue));
    }
  }, [isoValue, popoverActive]);

  const openPopover = useCallback(() => {
    if (!disabled) {
      setPopoverActive(true);
    }
  }, [disabled]);

  const handleFocus = useCallback(() => {
    if (skipFocusOpenRef.current) {
      skipFocusOpenRef.current = false;
      return;
    }
    openPopover();
  }, [openPopover]);

  const handleClear = useCallback(() => {
    skipFocusOpenRef.current = true;
    onChange(undefined);
    setPopoverActive(false);
  }, [onChange]);

  const textField = (
    <TextField
      label={label}
      value={displayValue}
      placeholder={placeholder}
      readOnly
      disabled={disabled}
      prefix={
        <span className={styles.fieldCalendarIcon}>
          <Icon source={CalendarIcon} tone="subdued" />
        </span>
      }
      suffix={
        hasValue && !disabled ? (
          <DateInputClearButton
            accessibilityLabel={`Clear ${label}`}
            onClear={handleClear}
          />
        ) : undefined
      }
      onFocus={handleFocus}
      onChange={() => {}}
      autoComplete="off"
    />
  );

  return (
    <div style={{ width: "100%" }}>
      <Popover
        active={popoverActive}
        autofocusTarget="none"
        fullWidth
        preferredAlignment="center"
        preferredPosition="above"
        onClose={() => setPopoverActive(false)}
        activator={textField}
      >
        <Popover.Pane fixed sectioned={false}>
          <div className={styles.surveyDatePopoverRoot}>
            <div className={styles.popoverSurface}>
              <div className={styles.compactCalendar}>
                <DatePicker
                  month={month}
                  year={year}
                  selected={selected}
                  disableDatesBefore={disableDatesBefore}
                  disableDatesAfter={disableDatesAfter}
                  onMonthChange={(nextMonth, nextYear) => {
                    setMonthYear({ month: nextMonth, year: nextYear });
                  }}
                  onChange={({ start }) => {
                    if (!start) {
                      return;
                    }
                    onChange(localDateToIso(start));
                    setPopoverActive(false);
                  }}
                />
              </div>
            </div>
            <div className={styles.popoverCaret} aria-hidden>
              <span className={styles.popoverCaretBorder} />
              <span className={styles.popoverCaretFill} />
            </div>
          </div>
        </Popover.Pane>
      </Popover>
    </div>
  );
}
