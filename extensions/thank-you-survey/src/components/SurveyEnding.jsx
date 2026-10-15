import { thankYouButtonHref } from "../survey/thank-you.js";

const FALLBACK_HEADING = "Thank you";
const FALLBACK_DESCRIPTION =
  "Thanks — your answers were recorded.";

/**
 * Post-submit ending card (competitor parity: merchant heading, description, CTA).
 */
export function SurveyEnding({ thankYou, surveyName }) {
  const heading =
    thankYou?.heading?.trim() ||
    surveyName?.trim() ||
    FALLBACK_HEADING;
  const description = thankYou?.description?.trim() || "";
  const showButton = thankYou?.enableButton === true;
  const buttonText = thankYou?.buttonText?.trim() || "Continue";
  const buttonHref = thankYouButtonHref(thankYou);
  const bodyText =
    description || (thankYou ? "" : FALLBACK_DESCRIPTION);

  return (
    <s-stack gap="base">
      <s-heading>{heading}</s-heading>

      {bodyText ? <s-text color="subdued">{bodyText}</s-text> : null}

      {showButton ? (
        <s-grid gridTemplateColumns="1fr" justifyItems="end">
          <s-button
            variant="primary"
            href={buttonHref ?? undefined}
            target={buttonHref ? "_blank" : undefined}
          >
            {buttonText}
          </s-button>
        </s-grid>
      ) : null}
    </s-stack>
  );
}
