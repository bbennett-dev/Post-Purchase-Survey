import type {
  PreviewDevice,
  SurveyQuestion,
  ThankYouContent,
} from "../../lib/survey/types";

interface EditorPreviewProps {
  question: SurveyQuestion | null;
  ending: ThankYouContent | null;
  device: PreviewDevice;
}

/**
 * Center canvas. Shows the selected question or ending on a Thank You page.
 */
export function EditorPreview({
  question,
  ending,
  device,
}: EditorPreviewProps) {
  const narrow = device !== "desktop";

  return (
    <s-box
      padding="base"
      background="subdued"
      borderRadius="base"
      minBlockSize="720px"
    >
      <s-stack gap="base" alignItems="center">
        <s-box
          padding="base"
          background="base"
          border="base"
          borderRadius="base"
          inlineSize={narrow ? "360px" : "100%"}
        >
          {ending ? (
            <EndingPreview ending={ending} />
          ) : (
            <CheckoutPreview
              question={question}
              showSummary={device === "desktop"}
            />
          )}
        </s-box>
      </s-stack>
    </s-box>
  );
}

function CheckoutPreview({
  question,
  showSummary,
}: {
  question: SurveyQuestion | null;
  showSummary: boolean;
}) {
  return (
    <s-grid
      gridTemplateColumns={showSummary ? "1fr 220px" : "1fr"}
      gap="base"
    >
      <s-stack gap="base">
        <s-heading>Store name</s-heading>
        <s-stack direction="inline" gap="small-200" alignItems="center">
          <s-icon type="check-circle" tone="success" />
          <s-text type="strong">Thank you, Jordan!</s-text>
        </s-stack>
        {question ? (
          <QuestionPreview question={question} />
        ) : (
          <s-paragraph color="subdued">
            Select a question to preview it.
          </s-paragraph>
        )}
      </s-stack>
      {showSummary ? (
        <s-stack gap="small-200">
          <s-text type="strong">Your order</s-text>
          <s-text>Monstera plant · $59.00</s-text>
          <s-text>Snake plant · $59.00</s-text>
          <s-text>Watering can · $39.00</s-text>
          <s-text type="strong">Total $162.00</s-text>
        </s-stack>
      ) : (
        <s-text color="subdued">$74.00</s-text>
      )}
    </s-grid>
  );
}

function QuestionPreview({ question }: { question: SurveyQuestion }) {
  return (
    <s-box padding="base" border="base" borderRadius="base">
      <s-stack gap="small-200">
        <s-text type="strong">{question.heading || "Untitled question"}</s-text>
        {question.description ? (
          <s-paragraph>{question.description}</s-paragraph>
        ) : null}
        {question.image?.url ? (
          <s-image src={question.image.url} alt="" aspectRatio="16/9" />
        ) : null}
        {question.answers ? (
          <s-choice-list
            label={question.heading}
            labelAccessibilityVisibility="exclusive"
            name={question.id}
          >
            {question.answers.map((answer) => (
              <s-choice key={answer.id} value={answer.id}>
                {answer.content || "Option"}
              </s-choice>
            ))}
          </s-choice-list>
        ) : null}
        {question.leftLabel || question.rightLabel ? (
          <s-stack
            direction="inline"
            gap="base"
            justifyContent="space-between"
          >
            <s-text color="subdued">{question.leftLabel}</s-text>
            <s-text color="subdued">{question.rightLabel}</s-text>
          </s-stack>
        ) : null}
        {question.type === "short_answer" ? (
          <s-text-field
            label="Answer"
            labelAccessibilityVisibility="exclusive"
            placeholder={question.placeholder || "Your answer"}
            readOnly
          />
        ) : null}
        {question.type === "consent_email" ? (
          <s-checkbox
            label={question.agreeDescriptionEmail || "I agree"}
            checked={false}
          />
        ) : null}
      </s-stack>
    </s-box>
  );
}

function EndingPreview({ ending }: { ending: ThankYouContent }) {
  return (
    <s-stack gap="small-200">
      <s-heading>{ending.heading}</s-heading>
      <s-paragraph>{ending.description}</s-paragraph>
      {ending.enableButton ? (
        <s-button variant="primary">{ending.buttonText || "Continue"}</s-button>
      ) : null}
    </s-stack>
  );
}
