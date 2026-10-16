# Survey library layout

| Folder / file | Purpose |
|---------------|---------|
| **`admin-api/`** | Embedded admin REST: read/write surveys, list mutations. Client helpers in `read.client.ts`, `save-document.client.ts`, `list-actions.client.ts`. Shared fetch: `app/lib/admin-api/fetch.client.ts`. |
| **`response/`** | Checkout submit pipeline + `response-list-api.server.ts` for `GET /api/responses`. |
| **`survey-store.server.ts`** | Prisma CRUD, editor persist, Shopify metafield sync. |
| **`types.ts`**, **`questions.ts`**, etc. | Survey document model and editor UI helpers. |

## Admin HTTP API (embedded; `authenticate.admin` + optional Bearer)

| Method | Path | Role |
|--------|------|------|
| `GET` | `/api/surveys` | List survey summary rows |
| `POST` | `/api/surveys` | Create blank survey |
| `GET` | `/api/surveys/:uuid` | Full survey document (`{ ok, data }`) |
| `PUT` | `/api/surveys/:uuid` | Save document |
| `POST` | `/api/surveys/:uuid` | `{ intent: duplicate \| toggle-status }` |
| `DELETE` | `/api/surveys/:uuid` | Delete survey |
| `GET` | `/api/responses?skip=&take=` | Paginated responses (`take` max 100) |

**Remix loaders** on `/app/*` remain the default for first paint; these routes are for Bearer clients, refresh, and competitor-style reads without changing page URL.
