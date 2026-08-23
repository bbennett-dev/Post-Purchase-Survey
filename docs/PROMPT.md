# Docs pack — AI + human entry point

**If you are an AI assistant:** this `docs/` folder is the project memory for **SnapPlux | Post-Purchase Survey & Attribution (HDYHAU)**. When the user attaches this folder (or these files) to a new chat, treat it as the source of truth for product decisions, architecture, and sprint history. Do **not** re-invent Sprint 1 choices unless the user explicitly changes them.

**If you are a human (Brooke / SnapPlux):** keep these files updated whenever behavior, schema, or surfaces change. Attach `docs/` (or at least this file + `DEV_TRACK.md` + the latest sprint) to a new Cursor chat so the next agent starts with context instead of guessing.

---

## How to use this folder in a new AI chat

1. Attach the whole `docs/` directory, **or** at minimum:
   - `docs/PROMPT.md` (this file)
   - `docs/DEV_TRACK.md`
   - `docs/sprints/sprint-01.md` (and later sprints as they appear)
2. Tell the agent something like: *“Read docs/PROMPT.md first, then DEV_TRACK and the latest sprint. Continue from there. Do not write code until I say go.”*
3. Prefer the **user rule**: plan → wait for **go** → implement. Ask questions if anything is unclear.

---

## Purpose of each file

| File | Audience | Purpose |
|------|----------|---------|
| `PROMPT.md` | AI + humans | Explains this folder, reading order, and how to stay consistent across chats. |
| `DEV_TRACK.md` | AI + humans | **Living** system map: product, stack, data flow, schema rules, auth, compliance, do-not-regress. Update when the system changes. |
| `sprints/sprint-01.md` | AI + humans | What Sprint 1 shipped, key decisions, files touched, verification, open follow-ups. |
| `sprints/sprint-NN.md` | AI + humans | Future sprint logs (create one per sprint). Keep historical; put “current truth” in `DEV_TRACK.md`. |

---

## Product one-liner (for any AI)

Free Shopify app: lightweight **“How did you hear about us?”** multi-select survey on **Thank You** and **Order Status**, with merchant admin settings, Neon/Postgres via Prisma, session-token public APIs. No email/phone stored on survey rows. Customer GID optional for GDPR + later cohorting.

Studio: **SnapPlux**. Founder persona: **Brooke Bennett**. Stack: `@shopify/shopify-app-react-router`, Checkout UI + Customer Account UI extensions (Preact), Polaris web components in admin.

---

## Rules for AI when continuing this project

1. Always query/filter by `shop` from a **verified** session token (`sessionToken.dest`), never trust `shop` from the request body.
2. Thank You and Order Status use **different** public authenticators and routes — do not merge into one CORS-authenticated route.
3. `APP_UNINSTALLED` deletes **sessions only**. Shop survey data is removed on **`shop/redact`**.
4. Do **not** store buyer email or phone on survey responses unless a later sprint explicitly requires it.
5. Multi-select: one `SurveyResponse` per order (`@@unique([shop, shopifyOrderGid])`); selections live in `SurveyResponseSelection`. Treat Prisma `P2002` as already-submitted success.
6. Soft-deactivate options; snapshot `optionLabel` at submit time.
7. Before writing code: clarify → plan (files, approach, risks) → wait for user **go** (unless they say “just do it”).
8. Use Shopify AI Toolkit / CLI skills for Shopify API and extension work; do not invent checkout targets.

---

## Reading order (AI)

1. This file (`PROMPT.md`)
2. `DEV_TRACK.md`
3. Latest `sprints/sprint-*.md` (start with `sprint-01.md` until Sprint 2 exists)
4. Then inspect the repo as needed

When you finish a sprint or change architecture, **update `DEV_TRACK.md` and add/update the sprint file** so the next chat stays accurate.
