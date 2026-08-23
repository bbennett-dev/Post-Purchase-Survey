# Sprint 1 — Foundation (shipped)

**Dates:** 2026-08-21  
**Goal:** Neon schema, public session-token APIs, admin settings + seed defaults, Thank You + Order Status survey blocks, GDPR compliance webhooks.

---

## Decisions locked in Sprint 1

| Topic | Decision |
|-------|----------|
| Selection | **Multi-select** (not single choice) |
| Surfaces | **Thank You + Order Status** (two extension types) |
| Admin | **Seed defaults + Polaris settings page** |
| Other | Include `otherText` when Other is selected |
| PII | Store **optional `shopifyCustomerGid`** only — **not** email or phone |
| Why customer GID | GDPR `customers/redact` / `data_request` targeting; later channel cohorting / repeat-buyer attribution. Guest checkout may leave it null. |
| Why no email/phone | Not required by Shopify; data minimization; weaker PCD surface; can resolve contact via Admin API at export time later if needed |

Default options: Instagram, Facebook, TikTok, Google, YouTube, Podcast, Friend / family, Other.

---

## What was built

### Database

- Switched Prisma from SQLite → PostgreSQL (Neon).
- Models: `Session`, `SurveyConfig`, `SurveyOption`, `SurveyResponse`, `SurveyResponseSelection`.
- Migration: `prisma/migrations/20260821100000_init_postgres/` (applied to Neon via `prisma migrate deploy`).

### Backend

- `ensureSurveyConfig` / seed on `afterAuth`.
- Public GET/POST for checkout and customer-account (separate routes).
- Admin save: heading, enabled, allowOther, add/reorder/soft-deactivate options (exactly one Other).
- Compliance webhook handler for data_request / customers_redact / shop_redact.
- Uninstall: sessions only (unchanged intent).

### Admin UI

- Replaced template “generate product” home with survey settings (`app/routes/app._index.tsx`).
- Nav simplified to Survey.

### Extensions (CLI scaffolded, then customized)

| Extension | Target | API path |
|-----------|--------|----------|
| `thank-you-survey` | `purchase.thank-you.block.render` | `/api/survey` |
| `order-status-survey` | `customer-account.order-status.block.render` | `/api/survey/customer-account` |

Both: `network_access = true`, multi-select choice list, Other text field, hide when disabled or already submitted.

### Config cleanup

- Removed demo product/metaobject definitions and scopes from `shopify.app.toml`.
- Added GDPR `compliance_topics`.
- Added `.env.example` and gitignore exception for it.

---

## Files introduced / heavily changed (Sprint 1)

- `prisma/schema.prisma`, `prisma/migrations/20260821100000_init_postgres/`
- `app/types/survey.ts`
- `app/lib/survey.server.ts`, `app/lib/public-survey.server.ts`
- `app/routes/api.survey.tsx`, `app/routes/api.survey.customer-account.tsx`
- `app/routes/webhooks.compliance.tsx`
- `app/routes/app._index.tsx`, `app/routes/app.tsx`, `app/shopify.server.ts`
- `shopify.app.toml`, `.env.example`, `env.d.ts`
- `extensions/thank-you-survey/**`, `extensions/order-status-survey/**`

---

## Verification checklist

- [ ] `shopify app dev` runs against Neon
- [ ] App home loads seeded options; Save works
- [ ] Thank You block placed; multi-select submit writes one response + N selections
- [ ] Refresh / resubmit does not create a second response (unique constraint)
- [ ] Order Status hides or shows thanks if already submitted on Thank You
- [ ] Partner Dashboard: request network access for both extensions before production publish
- [ ] Partner Dashboard: Protected Customer Data if shipping customer GID to App Store

---

## Known follow-ups (not Sprint 1)

- Analytics / attribution dashboard for merchants
- CSV / Admin API enrichment export (email at export time only if product needs it)
- Confirm `SHOPIFY_APP_URL` at extension build/deploy time in production hosting
- Reinstall stores that still hold old demo scopes so empty scopes + seed apply cleanly
- Optional: remove leftover template `app/routes/app.additional.tsx` if unused

---

## AI note

When continuing after Sprint 1, read `../PROMPT.md` and `../DEV_TRACK.md` first. Do not reopen single-select vs multi-select, Thank You-only vs both surfaces, or email storage unless the user asks to change those decisions.
