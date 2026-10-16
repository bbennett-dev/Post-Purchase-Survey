import type {
  SegmentConditionField,
  SegmentConditionOperator,
} from "../../../../lib/survey/types";

export const SEGMENT_FIELD_OPTIONS: {
  label: string;
  value: SegmentConditionField;
}[] = [{ label: "User tag", value: "user_tag" }];

export const SEGMENT_OPERATOR_OPTIONS: {
  label: string;
  value: SegmentConditionOperator;
}[] = [
  { label: "include", value: "include" },
  { label: "exclude", value: "exclude" },
];

/** Placeholder catalog until customer tags load from Admin API. */
export const SEGMENT_TAG_SUGGESTIONS = [
  "VIP",
  "Newsletter",
  "Wholesale",
  "Returning",
  "New customer",
];
