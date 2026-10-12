/**
 * Shared survey UI for Thank you and Order status targets.
 * Both read the same shop metafield published from the app editor Save action.
 */

export function readCheckoutSurveys(entries) {
  const entry = (entries ?? []).find(
    (item) =>
      item?.metafield?.key === "checkout_surveys" &&
      (item?.target?.type === "shop" || item?.target?.type == null),
  );
  const raw = entry?.metafield?.value;
  if (!raw) {
    return null;
  }
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export function firstSurvey(surveys) {
  if (!surveys || typeof surveys !== "object") {
    return null;
  }
  const values = Object.values(surveys);
  return (
    values.find((item) => item?.channels?.postPurchasePage?.enabled) ??
    values[0] ??
    null
  );
}

export function SurveyBlock({ survey, orderId }) {
  if (!survey) {
    return null;
  }

  const question = survey.questions?.[0];

  return (
    <s-section heading={survey.name || shopify.i18n.translate("surveyHeading")}>
      <s-stack gap="base">
        {question ? (
          <s-text type="strong">{question.heading}</s-text>
        ) : (
          <s-text>{shopify.i18n.translate("emptySurvey")}</s-text>
        )}
        {question?.answers?.length ? (
          <s-choice-list
            name={`survey-${survey.id}`}
            label={question.heading}
            labelAccessibilityVisibility="exclusive"
          >
            {question.answers.map((answer) => (
              <s-choice key={answer.id} value={answer.id}>
                {answer.content}
              </s-choice>
            ))}
          </s-choice-list>
        ) : null}
        <s-text color="subdued">
          {shopify.i18n.translate("orderRef", {
            orderId: orderId ? String(orderId) : "—",
          })}
        </s-text>
      </s-stack>
    </s-section>
  );
}
