/** Display / storage formats for date questions (competitor + legacy API). */
export type DateQuestionFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY/MM/DD";

export const DATE_QUESTION_FORMAT_OPTIONS: {
  label: string;
  value: DateQuestionFormat;
}[] = [
  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
  { label: "YYYY/MM/DD", value: "YYYY/MM/DD" },
];

/** Maps legacy API strings (e.g. `MM/d/YYYY`) to editor format tokens. */
export function normalizeDateQuestionFormat(
  stored: string | undefined,
): DateQuestionFormat {
  if (!stored?.trim()) {
    return "DD/MM/YYYY";
  }
  const value = stored.trim();
  if (value === "MM/d/YYYY" || value === "MM/DD/YYYY") {
    return "MM/DD/YYYY";
  }
  if (value === "d/M/YYYY" || value === "DD/MM/YYYY") {
    return "DD/MM/YYYY";
  }
  if (value === "YYYY-MM-dd" || value === "YYYY/MM/DD") {
    return "YYYY/MM/DD";
  }
  if (
    value === "DD/MM/YYYY" ||
    value === "MM/DD/YYYY" ||
    value === "YYYY/MM/DD"
  ) {
    return value;
  }
  return "DD/MM/YYYY";
}

export function dateFormatPlaceholder(format: DateQuestionFormat): string {
  return format;
}

/** Local calendar date (no time) from stored ISO. */
export function isoToLocalDate(iso: string | undefined): Date | undefined {
  if (!iso?.trim()) {
    return undefined;
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/** Store as midday UTC so the calendar day is stable across zones. */
export function localDateToIso(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
  ).toISOString();
}

export function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Format ISO for the competitor-style text field (per question date format). */
export function formatIsoForDisplay(
  iso: string | undefined,
  format: DateQuestionFormat,
): string {
  const date = isoToLocalDate(iso);
  if (!date) {
    return "";
  }
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  switch (format) {
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "YYYY/MM/DD":
      return `${yyyy}/${mm}/${dd}`;
    default:
      return `${dd}/${mm}/${yyyy}`;
  }
}

export function pickerMonthYearFromIso(iso: string | undefined): {
  month: number;
  year: number;
} {
  const date = isoToLocalDate(iso) ?? new Date();
  return { month: date.getMonth(), year: date.getFullYear() };
}
