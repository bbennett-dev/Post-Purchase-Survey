---
name: Survey save REST API
overview: Move merchant survey persistence from Remix editor.action (POST editor.data + FormData) to PUT /api/surveys/:surveyUuid with JSON body and Bearer session token; remove the old save action. Improves mutation-request hygiene without changing checkout response API.
todos:
  - id: save-server-helper
    content: Add parseSurveySaveRequestBody + saveSurveyDocumentForShop in app/lib/survey/save-survey-document.server.ts
    status: pending
  - id: api-put-route
    content: Add app/routes/api.surveys.$surveyUuid.tsx (PUT, auth, rate limit, body cap, JSON responses)
    status: pending
  - id: save-client-helper
    content: Add save-survey-document.client.ts using idToken + PUT { data: survey }
    status: pending
  - id: editor-wire-save
    content: Refactor app.surveys.editor.tsx to use client save; remove action export
    status: pending
  - id: tests-verify
    content: Add parser unit test; run typecheck/test; manual PUT in Network tab
    status: pending
isProject: false
---

# Survey save REST API

## Security rationale

### What the long `editor.data` URL is (and is not)

- **Not a survey content leak:** The full survey document is in the **request body** (`Form Data` field `survey`), not in the query string. Query param `survey=` is only the **survey UUID** (same role as competitor `?ids=` on their API).
- **Embedded-app noise is normal on page load:** `shop`, `host`, `embedded`, `hmac`, `timestamp`, `locale`, etc. appear on iframe **GET** navigations for every Shopify embedded app. That is platform behavior, not app-specific misconfiguration.
- **Credential-like query params on save POST:** When `useFetcher.submit()` runs inside the editor iframe, React Router posts to the **current document URL**, so **`id_token` and `session` repeat on every save** in the query string. That is **hygiene risk**, not “public exposure of survey JSON”:
  - **Referer / proxy / access logs** may capture query strings more often than `Authorization` headers.
  - **Browser history** on the merchant machine may store URLs containing short-lived JWTs.
  - **Replay:** A third party with a **fresh** stolen `id_token` (+ valid app session cookie when required) could act as that merchant until expiry—same class as any stolen admin session token. They **cannot** use URL params alone to administer arbitrary shops if `authenticate.admin` and tenant scoping remain correct.

### What actually protects the app (must keep)

1. **`authenticate.admin(request)`** on every admin write (new API route included).
2. **Shop from session** via [`shopFromAdminSession`](app/lib/shop/shop.server.ts)—never authorize from client `shopId` in JSON.
3. **URL `:surveyUuid` must match `survey.id`** in the body.
4. **Rate limit + JSON body cap** on PUT (reuse [`readJsonBodyWithLimit`](app/lib/security/request-body.server.ts)).
5. **HTTPS** in production (`SHOPIFY_APP_URL`); do not use dev tunnel URLs in App Store listing.

### What this plan improves

| Concern | Today (POST `editor.data`) | After (PUT `/api/surveys/:uuid`) |
|--------|----------------------------|----------------------------------|
| Survey JSON in URL | No (body only) | No (JSON body) |
| `id_token` on **save** request URL | Yes (inherited from iframe URL) | No—`Authorization: Bearer` via `shopify.idToken()` (same as [`upload-shopify-file.client.ts`](app/lib/images/upload-shopify-file.client.ts)) |
| Save URL in Network tab | Long Shopify query string | Short REST path |
| Dual write paths | Single `action` | Single API route (old `action` **removed**) |

### What this plan does not change

- **Editor loader** (`GET /app/surveys/editor?survey=…`) still uses embed query params on first load—expected for Shopify admin.
- **[`api.survey-response`](app/routes/api.survey-response.tsx)** (checkout buyer submits)—unchanged.
- **Merchant can still see survey JSON in DevTools** on save—that is their data in their browser; security boundary is server auth + tenant isolation.

### Old route disposition

- **Remove** [`app.surveys.editor.tsx`](app/routes/app.surveys.editor.tsx) **`action`** export when the editor uses PUT. Do **not** keep parallel save paths.
- **Keep** the editor **`loader`** for opening/editing surveys.

---

## Competitor vs ours (summary)

| | Competitor | Us (today) | Us (after plan) |
|--|------------|------------|-----------------|
| Save URL | `PUT …/api/survey?ids=` | `POST …/editor.data?…embed…` | `PUT /api/surveys/:surveyUuid` |
| Body | `{ "data": { … } }` | FormData `survey` JSON string | `{ "data": { … } }` |
| Auth | Their backend | `authenticate.admin` on action | `authenticate.admin` + Bearer on API |

---

## Implementation

### 1. Shared server handler

Add [`app/lib/survey/save-survey-document.server.ts`](app/lib/survey/save-survey-document.server.ts):

- `parseSurveySaveRequestBody(raw: unknown): SurveyDocument` — accept `{ data: SurveyDocument }` or bare document; validate `name`; typed errors.
- `saveSurveyDocumentForShop(admin, shop, surveyUuidFromUrl, survey)` — assert `survey.id === surveyUuidFromUrl`; call [`persistSurveyAndMaybePublishShopify`](app/lib/survey/survey-store.server.ts).

### 2. API route

Add [`app/routes/api.surveys.$surveyUuid.tsx`](app/routes/api.surveys.$surveyUuid.tsx):

- `authenticate.admin` → rate limit per shop (new constant in [`rate-limit-config.server.ts`](app/lib/security/rate-limit-config.server.ts), e.g. 30/min).
- `PUT` only; `readJsonBodyWithLimit` (~2–5 MB); JSON `{ ok, publishedToShopify }` / errors (`400`, `413`, `429`, `500`).
- Map `PublishSurveyError` like current editor action.

### 3. Client helper

Add [`app/lib/survey/save-survey-document.client.ts`](app/lib/survey/save-survey-document.client.ts):

- `saveSurveyDocument(survey, sessionToken)` → `fetch` PUT with `Content-Type: application/json`, `Authorization: Bearer`, `credentials: 'include'`, body `JSON.stringify({ data: survey })`.

### 4. Editor

Update [`app/routes/app.surveys.editor.tsx`](app/routes/app.surveys.editor.tsx):

- Remove **`action`**.
- Replace `useFetcher` save with `shopify.idToken()` + `saveSurveyDocument` (mirror [`useShopifyImageUpload`](app/hooks/useShopifyImageUpload.ts)).
- BroadcastChannel `"save"` uses same helper.

### 5. Verification

- Unit test: `parseSurveySaveRequestBody`.
- `npm run typecheck` && `npm run test`.
- Manual: Save → Network shows `PUT /api/surveys/<uuid>`, JSON body, no `editor.data` POST.
- Unauthenticated PUT → 401/403.

---

## Out of scope

- `GET /api/surveys/:id` (loader suffices).
- Path-based editor URL `/app/surveys/:id/editor` (cosmetic).
- Removing embed query params from initial admin page load.
