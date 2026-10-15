# App Store review package (v1)

Full product scope: [`V1_SHIPPING_AND_POST_APPROVAL_ROADMAP.md`](./V1_SHIPPING_AND_POST_APPROVAL_ROADMAP.md).  
**After approval, restore hidden UI:** attach [`POST_APPROVAL_UNGATE.md`](./POST_APPROVAL_UNGATE.md) only.

Post-purchase survey on **Thank you** and **Order status** only. End-to-end: create survey → save/publish → checkout block → submit → Responses admin.

## Prerequisites

- Development store with checkout extensibility
- App installed via Partner Dashboard or `shopify app dev`
- Postgres with migrations applied (`npm run setup`)
- `SHOPIFY_APP_URL` set to the public app URL (required for checkout submit link in metafields)

## Reviewer test script (~5 minutes)

1. **Install** — Open the app embedded in admin. Confirm Dashboard loads with Surveys / Responses / Settings (no Analytics or Integrations).
2. **Create survey** — Surveys → Create survey. Use **Add content** (five question types only). Channel tab: enable **Thank you / Order status** only. No Discount tab or Advanced logic in v1.
3. **Save** — Save from the editor. Expect success toast; survey appears on Surveys list as Live.
4. **Checkout block** — Settings (or editor checkout links) → add **Post Purchase Survey** on Thank you and optionally Order status.
5. **Test order** — Place a test order. On Thank you, select an answer → Submit. See thank-you confirmation in the block.
6. **Responses** — Admin → Responses. New row with order, survey name, answer, timestamp.

## Screencast outline (3–5 min)

1. Install / open app
2. Create + save survey (channel enabled)
3. Checkout editor: add block
4. Test checkout submit
5. Show Responses table

## Automated checks before submit

```bash
npm run typecheck
npm run build
shopify app deploy --dry-run
```

## Production deploy notes

- Set `application_url` and OAuth redirect URLs in `shopify.app.toml` to production host
- Run `prisma migrate deploy` on production database
- Register webhooks after deploy (CLI deploy or Partner Dashboard)

## Out of scope for v1 listing

Branded survey page, on-site widget, email, analytics charts, integrations connect flows, and extra channel types are hidden in the editor for this release.
