# Survey display eligibility

Decides whether a survey **widget should render** for a buyer on a given **channel** (thank-you page today; others later). This is separate from **submit/response storage** (app DB) and separate from **checkout UI extensions** (each extension bundle is channel-specific).

## Layout

```
display-eligibility/
  README.md                 ← you are here
  types.ts                  ← API input/output + buyer segment types
  rules/                    ← pure functions (no Shopify, no DB)
    buyer-lifecycle.ts
    segment-targeting.ts
    widget-recurrence.ts
    display-rules.test.ts
  server/                   ← shared Admin GraphQL helpers
    resolve-display-eligibility.server.ts   ← entry: dispatch by channelKey
    buyer-from-order.server.ts
    published-survey.server.ts              ← $app.checkout_surveys metafield
  channels/                 ← one module per survey.channels key
    post-purchase-page.server.ts
  completion/               ← customer metafield for “once per customer”
    survey-completions.ts
    survey-completions.server.ts
    survey-completions.test.ts
```

## HTTP API

- **Route:** `GET /api/survey-eligibility`
- **Auth:** `authenticate.public.checkout` (session token from checkout UI)
- **Query:** `surveyId` (required), `channelKey` (defaults to `postPurchasePage`), plus optional `orderId`, `customerId`, `email`, `isFirstOrder`
- **Response:** `{ show: boolean }`
- **Data sources:** Shopify Admin GraphQL + shop/customer metafields only — **no Prisma** on this route

Published config exposes `eligibilityUrl` next to `submitUrl` in `$app.checkout_surveys.__config` (see `publish-shopify.server.ts`).

## Channel runtimes vs server

| Layer | Responsibility |
|--------|----------------|
| **Checkout extension** (`extensions/thank-you-survey/`) | Reads `postPurchasePage` from metafield; sync fast path when possible; calls `eligibilityUrl` with `channelKey=postPurchasePage` |
| **`resolveSurveyDisplayEligibility`** | Loads shop session, switches on `channelKey`, runs channel resolver |
| **Channel resolver** | Loads published channel config + applies that channel’s rules |

Other channels (on-site widget, email, POS) should ship their **own runtime** but reuse this API with the matching `channelKey`.

## Shared document shapes

Channels that use merchant “User targeting” + “Widget recurrence” in the editor store:

- `SurveyChannelDisplayRules` / `SurveyChannelUserTargeting` in `app/lib/survey/types.ts`

Pure helpers in `rules/` operate on those shapes. Channels with different rules add a new file under `channels/` and do **not** need to use every rule module.

## Adding a new channel

1. Add the key to `CHECKOUT_SURVEYS_CHANNEL_KEYS` in `runtime-channels.ts` when the runtime reads `$app.checkout_surveys` (or document another config source in your channel resolver).
2. Implement `resolve<Channel>DisplayEligibility` under `channels/`.
3. Add a `case` in `server/resolve-display-eligibility.server.ts` (TypeScript exhaustiveness will force this when the union grows).
4. Ship a runtime that passes `channelKey` on eligibility requests.
5. Add tests: pure rules in `rules/*.test.ts`, channel resolver with mocked Admin when non-trivial.

## Compatibility shims (survey root)

These re-export the modules above; prefer importing from `display-eligibility/` in new code:

- `post-purchase-eligibility.ts` / `post-purchase-eligibility.server.ts`
- `checkout-surveys-metafield.server.ts` → `server/published-survey.server.ts`
- `survey-completion-metafield.ts` / `.server.ts` → `completion/survey-completions*`

## Related code outside this folder

- **Submit → completion metafield:** `survey-response.server.ts` calls `recordSurveyCompletionOnCustomer` after DB save.
- **OAuth:** `write_customers` is required for `metafieldsSet` on Customer (`survey_completions`). After adding scopes, reinstall the app on the dev store (or accept the scope update prompt) and redeploy config so the customer metafield definition is registered.
- **Post-purchase display copy/layout:** `post-purchase-display.ts` (not eligibility).
- **Editor targeting UI:** `PostPurchaseSettings.tsx` on the thank-you channel.
