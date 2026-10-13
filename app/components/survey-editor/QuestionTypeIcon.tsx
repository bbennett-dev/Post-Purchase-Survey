import { Icon } from "@shopify/polaris";
import type { IconProps } from "@shopify/polaris";
import type { QuestionType } from "../../lib/survey/types";
import { questionTypeIconSource } from "./questionTypeIcons";

interface QuestionTypeIconProps {
  type: QuestionType;
  tone?: IconProps["tone"];
}

/** Maps survey question types onto Polaris icons. */
export function QuestionTypeIcon({ type, tone }: QuestionTypeIconProps) {
  return <Icon source={questionTypeIconSource(type)} tone={tone} />;
}
