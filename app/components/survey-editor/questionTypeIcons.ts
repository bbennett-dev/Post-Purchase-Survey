import type { IconSource } from "@shopify/polaris";
import {
  CalendarIcon,
  CheckboxIcon,
  EmailIcon,
  EmailNewsletterIcon,
  HashtagIcon,
  NoteIcon,
  SmileyHappyIcon,
  StarIcon,
  TextWithImageIcon,
} from "@shopify/polaris-icons";
import type { QuestionType } from "../../lib/survey/types";
import { SingleChoiceIcon } from "./icons/SingleChoiceIcon";

/** Polaris icons aligned with competitor question-type menu (Add content + list rows). */
const QUESTION_TYPE_ICON_SOURCES: Record<QuestionType, IconSource> = {
  single: SingleChoiceIcon,
  multiple: CheckboxIcon,
  number_scale: HashtagIcon,
  star_rating: StarIcon,
  satisfaction: SmileyHappyIcon,
  short_answer: NoteIcon,
  date: CalendarIcon,
  consent_email: EmailNewsletterIcon,
  text_image: TextWithImageIcon,
  email: EmailIcon,
};

/** Icon component source for a survey question type. */
export function questionTypeIconSource(type: QuestionType): IconSource {
  return QUESTION_TYPE_ICON_SOURCES[type] ?? SingleChoiceIcon;
}
