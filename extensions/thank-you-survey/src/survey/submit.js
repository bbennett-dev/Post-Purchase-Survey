import { CHECKOUT_CHANNEL_KEY } from "../channel-config.js";
import { channelDisplayType } from "./checkout-data.js";

export async function submitSurveyResponse({
  submitUrl,
  orderId,
  survey,
  answers,
  pageType,
  channelType,
  displayType = null,
}) {
  const token = await shopify.sessionToken.get();
  const resolvedChannel = channelType ?? CHECKOUT_CHANNEL_KEY;
  const response = await fetch(submitUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      surveyId: survey.id,
      surveyName: survey.name,
      surveyType: survey.surveyType ?? "survey",
      answers,
      pageType,
      channelType: resolvedChannel,
      displayType:
        displayType ?? channelDisplayType(survey, resolvedChannel),
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Submit failed");
  }
}
