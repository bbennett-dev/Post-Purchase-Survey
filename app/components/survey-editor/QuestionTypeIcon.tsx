import { Icon } from "@shopify/polaris";
import type { IconProps } from "@shopify/polaris";
import {
  CalendarIcon,
  CheckboxIcon,
  EmailIcon,
  HashtagIcon,
  ImageIcon,
  SmileyHappyIcon,
  StarIcon,
  TextIcon,
} from "@shopify/polaris-icons";
import { questionIcon } from "../../lib/survey/questions";
import type { QuestionType } from "../../lib/survey/types";

const ICONS: Record<string, typeof TextIcon> = {
  circle: CheckboxIcon,
  checkbox: CheckboxIcon,
  hashtag: HashtagIcon,
  star: StarIcon,
  "smiley-happy": SmileyHappyIcon,
  text: TextIcon,
  calendar: CalendarIcon,
  email: EmailIcon,
  image: ImageIcon,
};

interface QuestionTypeIconProps {
  type: QuestionType;
  tone?: IconProps["tone"];
}

/** Maps survey question types onto Polaris icons. */
export function QuestionTypeIcon({ type, tone }: QuestionTypeIconProps) {
  const source = ICONS[questionIcon(type)] ?? CheckboxIcon;
  return <Icon source={source} tone={tone} />;
}
