import type { ComponentType } from "react";
import type { QuestionType } from "../../../../lib/survey/types";
import { ConsentEmailInspector } from "./types/ConsentEmailInspector";
import { DateQuestionInspector } from "./types/DateQuestionInspector";
import { EmailQuestionInspector } from "./types/EmailQuestionInspector";
import { ChoiceQuestionInspector } from "./choice/ChoiceQuestionInspector";
import type { QuestionTypeInspectorProps } from "./types/QuestionTypeInspectorProps";
import { NumberScaleInspector } from "./types/NumberScaleInspector";
import { SatisfactionInspector } from "./types/SatisfactionInspector";
import { ShortAnswerInspector } from "./types/ShortAnswerInspector";
import { StarRatingInspector } from "./types/StarRatingInspector";
import { TextImageInspector } from "./types/TextImageInspector";

const QUESTION_INSPECTORS: Record<
  QuestionType,
  ComponentType<QuestionTypeInspectorProps>
> = {
  single: ChoiceQuestionInspector,
  multiple: ChoiceQuestionInspector,
  number_scale: NumberScaleInspector,
  star_rating: StarRatingInspector,
  satisfaction: SatisfactionInspector,
  short_answer: ShortAnswerInspector,
  date: DateQuestionInspector,
  email: EmailQuestionInspector,
  consent_email: ConsentEmailInspector,
  text_image: TextImageInspector,
};

export function QuestionTypeInspector(props: QuestionTypeInspectorProps) {
  const Component = QUESTION_INSPECTORS[props.question.type];
  return <Component {...props} />;
}
