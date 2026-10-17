# Post Purchase Survey (checkout UI extension)

Thank you + Order status survey (block and announcement bar).

## Source layout

```
src/
  block/                    # Inline survey on the page
    ThankYouPage.jsx        # purchase.thank-you.block.render
    OrderStatusPage.jsx     # customer-account.order-status.block.render

  announcement/             # Top announcement bar + modal survey
    ThankYouAnnouncement.jsx
    OrderStatusAnnouncement.jsx
    SurveyAnnouncement.jsx  # bar + modal shell (uses shared SurveyBlock)

  shared/                   # Used by block + announcement
    index.jsx               # SurveyBlock + metafield readers
    channel-config.js
    lib/
    survey/                 # flow, validation, submit, display guards
    components/             # CheckoutSurveyFrame, SurveyFormFooter, …
    questions/              # QuestionStep + per-type renderers
```

Admin preview parity: `app/components/survey-editor/preview/SurveyPreviewStep.tsx` and `app/lib/survey/preview-survey-flow.ts`.
