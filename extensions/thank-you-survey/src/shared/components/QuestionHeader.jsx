/**
 * Heading, description, and optional image (all question types).
 * Mirrors the header block in `SurveyPreviewStep`.
 */
export function QuestionHeader({ question }) {
  const imageUrl = question.image?.url;
  const isTextImage = question.type === "text_image";

  return (
    <s-stack gap="small">
      <s-heading>{question.heading}</s-heading>
      {question.description ? (
        <s-text color="subdued">{question.description}</s-text>
      ) : null}
      {imageUrl ? <s-image src={imageUrl} alt="" /> : null}
      {isTextImage && !imageUrl ? (
        <s-text color="subdued">
          Add an image in the editor to preview this question.
        </s-text>
      ) : null}
    </s-stack>
  );
}
