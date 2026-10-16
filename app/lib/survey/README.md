# Survey library layout

| Folder / file | Purpose |
|---------------|---------|
| **`admin-api/`** | Embedded admin REST: save document (`PUT`), list mutations (create / duplicate / delete / toggle). Client helpers use `app/lib/admin-api/fetch.client.ts`. |
| **`response/`** | Checkout extension submit pipeline: parse body, enrich context, normalize answers, persist `SurveyResponse`, merchant list DTOs. |
| **`survey-store.server.ts`** | Prisma CRUD, editor persist, Shopify metafield sync. |
| **`publish-shopify.server.ts`** | Publish active surveys to checkout metafields. |
| **`types.ts`**, **`questions.ts`**, **`channels.ts`**, etc. | Survey document model and editor UI helpers. |

HTTP routes: `app/routes/api.surveys*.tsx`, `app/routes/api.survey-response.tsx`.
