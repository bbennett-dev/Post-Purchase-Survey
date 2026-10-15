# Post Purchase Survey (checkout UI extension)

Thank you + Order status survey block.

## Source layout

```
src/
  ThankYouPage.jsx          # purchase.thank-you.block.render
  OrderStatusPage.jsx       # customer-account.order-status.block.render
  channel-config.js
  shared.jsx                # public exports (SurveyBlock, metafield readers)

  survey/                   # flow, validation, submit (mirrors app preview-survey-flow)
  components/               # CheckoutSurveyFrame, QuestionHeader, SurveyFormFooter
  questions/
    QuestionStep.jsx        # dispatches by question.type
    choice/                 # single + multiple
    fields/                 # short_answer, email, date, consent_email
    number-scale/
    star-rating/
    satisfaction/
```

Admin preview parity: `app/components/survey-editor/preview/SurveyPreviewStep.tsx` and `app/lib/survey/preview-survey-flow.ts`.
