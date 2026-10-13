import { BlockStack, Divider } from "@shopify/polaris";
import type { ShortAnswerFormat } from "../../../../../lib/survey/types";
import { QuestionImageBlock } from "../common/QuestionImageBlock";
import { QuestionSkippableCheckbox } from "../common/QuestionSkippableCheckbox";
import { resolveQuestionImage } from "../common/questionImageDefaults";
import { ShortAnswerAnswersSection } from "../shortAnswer/ShortAnswerAnswersSection";
import {
  parseOptionalInt,
  ShortAnswerValidationSection,
} from "../shortAnswer/ShortAnswerValidationSection";
import type { QuestionTypeInspectorProps } from "./QuestionTypeInspectorProps";

/**
 * Short answer — competitor layout: image → skip → Answer(s) → validation.
 */
export function ShortAnswerInspector({
  question,
  onQuestionChange,
}: QuestionTypeInspectorProps) {
  const answerFormat: ShortAnswerFormat = question.answerFormat ?? "any_text";
  const validationEnabled = question.enabledAnswerValidation === true;

  return (
    <BlockStack gap="500">
      <QuestionImageBlock
        image={resolveQuestionImage(question)}
        onChange={(image) => onQuestionChange({ image })}
        showSize
      />

      <QuestionSkippableCheckbox
        checked={question.skippable}
        onChange={(skippable) => onQuestionChange({ skippable })}
      />

      <Divider />

      <ShortAnswerAnswersSection
        placeholder={question.placeholder ?? ""}
        onChange={(placeholder) => onQuestionChange({ placeholder })}
      />

      <Divider />

      <ShortAnswerValidationSection
        enabled={validationEnabled}
        answerFormat={answerFormat}
        minCharacters={
          question.minCharacters !== undefined
            ? String(question.minCharacters)
            : ""
        }
        maxCharacters={
          question.maxCharacters !== undefined
            ? String(question.maxCharacters)
            : ""
        }
        onEnabledChange={(enabledAnswerValidation) =>
          onQuestionChange({ enabledAnswerValidation })
        }
        onFormatChange={(format) => onQuestionChange({ answerFormat: format })}
        onMinCharactersChange={(value) =>
          onQuestionChange({ minCharacters: parseOptionalInt(value) })
        }
        onMaxCharactersChange={(value) =>
          onQuestionChange({ maxCharacters: parseOptionalInt(value) })
        }
      />
    </BlockStack>
  );
}
