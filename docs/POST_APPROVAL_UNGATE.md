# Post–App Store approval: restore hidden product UI

**Attach this file only** when you want to undo v1 **scope hiding** (channels + admin nav) after Shopify approval.  
Do **not** attach the full v1 shipping roadmap for this job — use this document.

---

## Prompt to paste in Cursor (copy as-is)

```text
App Store v1 is approved. Execute every step in docs/POST_APPROVAL_UNGATE.md:
- Flip v1 product flags
- Restore Analytics + Integrations in nav and dashboard
- Run npm run typecheck
- Summarize what changed and what still needs runtime work per channel
Do not remove v1 persistence, checkout submit API, GDPR webhooks, or Responses wiring.
```

---

## What this restores vs what it does not

| Restored by this playbook | **Not** reverted (keep as-is) |
|---------------------------|-------------------------------|
| All 8 **Channel** rows in the survey editor | Prisma `Survey` / `SurveyResponse` |
| Editor inspectors for hidden channels (UI already built) | Save → publish live surveys + metafields |
| **Advanced logic** toolbar workspace | `/api/survey-response` + extension submit |
| **Discount** left-panel tab + inspectors | Compliance webhooks (`compliance_topics` in TOML) |
| All **10** question types in Add content + type dropdown | Uninstall / redact data deletion |
| **Analytics** & **Integrations** in app nav | |
| Dashboard tiles linking to those pages | |

Hidden channel **UI** exists in the repo; **runtime** (storefront, email, widget, etc.) is still post-approval work — see [V1_SHIPPING_AND_POST_APPROVAL_ROADMAP.md](./V1_SHIPPING_AND_POST_APPROVAL_ROADMAP.md).

---

## Step 1 — Master switch (required)

**File:** `app/lib/v1-product.ts`

Set:

```ts
export const V1_APP_STORE_SCOPE = false;
```

Leave `V1_CHANNEL_KEYS` and `V1_QUESTION_TYPE_KEYS` as-is (ignored when scope is `false`).

**Effect when `V1_APP_STORE_SCOPE = false`:**

| Mechanism | Restores |
|-----------|----------|
| `isV1EditorLimited()` → `false` | Advanced logic button, Discount tab, full question-type menus |
| `channelDefinitionsForEditor()` | All 8 channels in Channel tab |
| `questionTypesForEditor()` | All entries in `QUESTION_TYPES` (`app/lib/survey/questions.ts`) |
| `editorPanelTabsForUi()` | Content + Channel + **Discount** |

No other editor files need manual edits if Step 1 is done.

---

## Step 2 — Restore app navigation (required)

**File:** `app/routes/app.tsx`

Inside `<NavMenu>`, after **Responses** and before **Settings**, add:

```tsx
<Link to="/app/analytics">Analytics</Link>
<Link to="/app/integrations">Integrations</Link>
```

Final order should be:

1. Dashboard (`/app`, `rel="home"`)
2. Surveys
3. Responses
4. Analytics
5. Integrations
6. Settings

---

## Step 3 — Restore dashboard tiles (required)

**File:** `app/routes/app._index.tsx`

In the `NAV_TILES` array, add two entries (e.g. after Responses, before Settings):

```ts
{
  to: "/app/analytics",
  heading: "Analytics",
  body: "Response rates and channel trends (expand as charts ship).",
},
{
  to: "/app/integrations",
  heading: "Integrations",
  body: "Connect Klaviyo, Sheets, or webhooks when flows are live.",
},
```

---

## Step 4 — Integrations page honesty (strongly recommended before Step 2 ships to production)

**File:** `app/routes/app.integrations.tsx`

Today, **Connect** shows a toast only (“setup comes next”). That is acceptable for **internal/dev** un-gate but risky if merchants expect real OAuth.

Pick **one** before linking Integrations in nav for all merchants:

| Option | Action |
|--------|--------|
| **A — Safe default** | Replace **Connect** with disabled button or remove it; add copy: “Coming in a future update.” |
| **B — Ship real flows** | Implement connection before un-gating (see roadmap Release 7). |

If you only flip nav without changing Integrations, document that in release notes.

**Analytics** (`app/routes/app.analytics.tsx`) is already a non-deceptive placeholder — safe to expose in nav.

---

## Step 5 — Verify (required)

```bash
npm run typecheck
```

Manual smoke test:

1. Open app → nav shows **Analytics** and **Integrations**.
2. Open survey editor → **Channel** tab lists **8** channels (not only Thank you page).
3. Select **Branded survey page** → left/right panels render (no “Unknown channel”).
4. Toolbar shows **Advanced logic**; left tabs include **Discount**.
5. **Add content** lists all question types (Short answer, Date, Email, etc.).
6. Save/publish a Thank you survey still works; Responses still loads.

---

## Optional — Phased un-gate (one channel at a time)

If you are **not** ready for all eight channels in nav/listing, keep `V1_APP_STORE_SCOPE = true` and extend allowlists only:

```ts
export const V1_APP_STORE_SCOPE = true;
export const V1_CHANNEL_KEYS = [
  "postPurchasePage",
  "dedicatedPageSurvey", // add one key at a time
] as const;
// Optional: add question types before full un-gate
export const V1_QUESTION_TYPE_KEYS = [
  "single",
  "multiple",
  "number_scale",
  "star_rating",
  "satisfaction",
  "short_answer", // example: sixth type only
] as const;
```

**Note:** Advanced logic and Discount stay hidden while `V1_APP_STORE_SCOPE === true` (`isV1EditorLimited()`). To expose only Discount early, you would temporarily set `V1_APP_STORE_SCOPE = false` or add a dedicated flag (not recommended—use full un-gate instead).

Skip Steps 2–3 until the related admin/checkout surfaces are ready.

---

## Optional — Comment / tag in git

After completing Steps 1–5:

```bash
git tag -a post-approval-ungate -m "Restore full channel catalog and admin nav after App Store v1"
```

---

## File checklist (agent completion report)

| # | File | Change |
|---|------|--------|
| 1 | `app/lib/v1-product.ts` | `V1_APP_STORE_SCOPE = false` |
| 2 | `app/routes/app.tsx` | Nav links Analytics + Integrations |
| 3 | `app/routes/app._index.tsx` | Dashboard tiles for same |
| 4 | `app/routes/app.integrations.tsx` | Optional: de-fake Connect buttons |
| — | `npm run typecheck` | Must pass |

---

## Related docs

| Doc | Use when |
|-----|----------|
| [V1_SHIPPING_AND_POST_APPROVAL_ROADMAP.md](./V1_SHIPPING_AND_POST_APPROVAL_ROADMAP.md) | What v1 shipped + **building** channel runtimes after un-gate |
| [APP_STORE_REVIEW.md](./APP_STORE_REVIEW.md) | Reviewer QA for v1 only |

---

*Single-file playbook for post-approval UI restore. Last aligned with `V1_APP_STORE_SCOPE` in `app/lib/v1-product.ts`.*
