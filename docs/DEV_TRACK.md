# SnapPlux HDYHAU — living development track

Last updated: 2026-08-21 (after Sprint 1)

This file is the **current** picture of the system. Sprint logs under `sprints/` are history. If they conflict, prefer this file — then fix the sprint doc.

---

## Product

| Item | Value |
|------|--------|
| Name | SnapPlux \| Post-Purchase Survey & Attribution (HDYHAU) |
| Business model | Free (frictionless install, reviews) |
| Core UX | Multi-select “How did you hear about us?” on Thank You + Order Status |
| Admin | Polaris settings: heading, enabled, allow Other, edit/reorder options |
| Privacy | No email/phone on survey rows; optional `shopifyCustomerGid` for GDPR + cohorting |

### Default options (seed)

Instagram, Facebook, TikTok, Google, YouTube, Podcast, Friend / family, **Other** (`isOther: true`, free text when selected).

---

## Stack

- Framework: Shopify React Router template (`@shopify/shopify-app-react-router`)
- Admin UI: App Bridge + Polaris web components
- DB: Neon serverless PostgreSQL + Prisma (`DATABASE_URL` pooled, `DIRECT_URL` for migrate)
- Extensions: Preact + Polaris web components
  - Thank You: Checkout UI → `purchase.thank-you.block.render`
  - Order Status: Customer Account UI → `customer-account.order-status.block.render`

---

## Architecture (data flow)

```
Thank You extension  --Bearer JWT-->  /api/survey
                                         |
Order Status extension --Bearer JWT-->  /api/survey/customer-account
                                         |
                              authenticate.public.checkout
                              OR authenticate.public.customerAccount
                                         |
                              shop = sessionToken.dest
                                         |
                              Neon (SurveyConfig / Option / Response / Selection)

Merchant admin /app  --authenticate.admin-->  same survey tables
Webhooks: uninstall (sessions), compliance (GDPR redact / data request)
```

### Public API contract

| Surface | Route | Auth |
|---------|-------|------|
| Thank You | `GET/POST /api/survey` | `authenticate.public.checkout` |
| Order Status | `GET/POST /api/survey/customer-account` | `authenticate.public.customerAccount` |

- **GET** — returns heading, flags, active options, `alreadySubmitted` for order GID.
- **POST** — body: `shopifyOrderGid`, optional order number / checkoutToken / customerGid, `optionIds[]`, optional `otherText`, `source`.
- Duplicate order → unique constraint → `{ ok: true, alreadySubmitted: true }`.

Shared logic: `app/lib/survey.server.ts` + `app/lib/public-survey.server.ts`.

---

## Schema (Prisma / Neon)

Models: `Session` (Shopify-required name), `SurveyConfig` (1 per shop), `SurveyOption`, `SurveyResponse` (1 per shop+order), `SurveyResponseSelection` (many per response).

Key constraints / indexes:

- `SurveyConfig.shop` unique
- `SurveyResponse` `@@unique([shop, shopifyOrderGid])`
- Indexes on `(shop, createdAt)`, `(shop, shopifyCustomerGid)`
- Option delete → selection FK `SetNull`; config delete cascades responses
- Soft-deactivate options (`isActive`); snapshot `optionLabel` on selection rows

Migration applied: `prisma/migrations/20260821100000_init_postgres/`.

---

## Compliance

| Topic | Route / behavior |
|-------|------------------|
| `app/uninstalled` | Delete `Session` for shop only |
| `customers/data_request` | Log/find responses by customer GID and/or order GIDs |
| `customers/redact` | Delete matching `SurveyResponse` rows |
| `shop/redact` | Delete `SurveyConfig` (cascades options + responses) |

Configured in `shopify.app.toml` via `compliance_topics`.

Access scopes Sprint 1: **empty** (no Admin product/metaobject APIs). PCD (Protected Customer Data) needed before App Store if shipping customer GID.

---

## Key repo paths

| Path | Role |
|------|------|
| `prisma/schema.prisma` | DB models |
| `app/shopify.server.ts` | Shopify app + `afterAuth` seed |
| `app/lib/survey.server.ts` | Seed, public get/submit, admin save, GDPR helpers |
| `app/lib/public-survey.server.ts` | Shared public loader/action factories |
| `app/routes/api.survey.tsx` | Thank You API |
| `app/routes/api.survey.customer-account.tsx` | Order Status API |
| `app/routes/app._index.tsx` | Merchant survey settings |
| `app/routes/webhooks.compliance.tsx` | GDPR webhooks |
| `extensions/thank-you-survey/` | Thank You block |
| `extensions/order-status-survey/` | Order Status block |
| `.env.example` | Env template (no secrets) |

---

## Do not regress

1. Never trust `shop` from client JSON — use verified JWT `dest`.
2. Keep two public routes / two authenticators for the two surfaces.
3. Uninstall ≠ shop redact.
4. No email/phone on survey rows unless a sprint explicitly adds it.
5. Extensions need `network_access = true` and Partner Dashboard network approval for production.
6. Extension `fetch` uses `process.env.SHOPIFY_APP_URL` (injected in `shopify app dev`).

---

## Local ops

```bash
# .env must include DATABASE_URL (pooler) + DIRECT_URL (direct)
npx prisma migrate deploy
npx prisma generate
shopify app dev
```

Then: open app → save settings → add both extension blocks in Checkout / customer accounts editor → place test order.

---

## Sprint status

| Sprint | Status | Notes |
|--------|--------|--------|
| 1 | Done | Schema, APIs, admin, both extensions, GDPR wiring — see `sprints/sprint-01.md` |
| 2 | Not started | Likely: analytics/dashboard, CSV export, polish placement UX |

When Sprint 2 starts: add `sprints/sprint-02.md` and update this file’s “Last updated” + sprint table.
