import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/block/ThankYouPage.jsx' {
  const shopify: import('@shopify/ui-extensions/purchase.thank-you.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/block/OrderStatusPage.jsx' {
  const shopify: import('@shopify/ui-extensions/customer-account.order-status.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/announcement/ThankYouAnnouncement.jsx' {
  const shopify: import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/announcement/OrderStatusAnnouncement.jsx' {
  const shopify: import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/channel-config.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/lib/order-id.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/submission-context.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/thank-you.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/post-purchase-display.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/index.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/SurveyBlock.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/checkout-data.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/components/CheckoutSurveyFrame.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/components/SurveyEnding.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/components/SurveyFormFooter.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/questions/QuestionStep.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/draft.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/submit.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/auto-advance.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/validate.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/components/QuestionHeader.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/question-answers.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/questions/choice/ChoiceQuestion.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/questions/fields/QuestionFields.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/questions/number-scale/NumberScaleQuestion.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/questions/satisfaction/SatisfactionQuestion.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/questions/star-rating/StarRatingQuestion.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/survey/constants.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/lib/checkout-events.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/questions/number-scale/number-scale-ui.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/questions/star-rating/star-rating-ui.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.block.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.block.render').Api
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/announcement/SurveyAnnouncement.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.thank-you.announcement.render').Api
    | import('@shopify/ui-extensions/customer-account.order-status.announcement.render').Api;
  const globalThis: { shopify: typeof shopify };
}
