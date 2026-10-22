# Vercel, Neon, and connection pool errors

This document explains why a **single** app on Vercel can hit Prisma connection pool timeouts against Neon, why logs sometimes show `MissingSessionTableError` even when the `Session` table exists, and what we changed in this repo to fix it.

## The misleading error

Production logs may show:

```text
MissingSessionTableError: Prisma session table does not exist.
cause: The table `session` does not exist in the current database.
```

Earlier in the same request you may see:

```text
Error obtaining session table: ... Timed out fetching a new connection from the connection pool.
(Current connection pool timeout: 10, connection limit: 5)
```

**The table usually exists.** Shopify’s `@shopify/shopify-app-session-storage-prisma` runs `prisma.session.count()` on startup. If *any* error happens (including a pool timeout), it retries twice, then throws a generic message that the `session` table does not exist. That wording is misleading when the real problem is **could not get a connection in time**.

Locally the same `DATABASE_URL` works because you have **one long-lived process** and requests tend to be sequential. On Vercel the pattern is different.

## It is not “many apps” — it is many workers and many calls at once

You only need **one** deployed app to hit this.

| Where | What happens |
|--------|----------------|
| **Local (`shopify app dev`)** | One Node process. One Prisma client. Clicks usually send requests **one after another**. |
| **Vercel** | Each HTTP request may run on a **separate function instance**. Shopify Admin often sends **several requests at once** when the embedded app opens (`/app`, loaders, settings, etc.). |

The database still sees **one app**, but **many callers at once**:

1. **Several Vercel instances** — each warm instance can hold database connections.
2. **One instance, many parallel queries** — before our fix, **each** instance’s Prisma pool defaulted to **5** connections. Six parallel queries on the **same** instance → five slots busy → the sixth waits (default 10s) → **pool timeout**.

That is **inside your single app**, not other projects using your database.

Neon’s free tier also caps **real** Postgres connections. Many warm Vercel instances × 5 Prisma connections each adds up quickly even with only one application.

## Does every deploy leave connections open forever?

**No.** A deploy does not permanently leak connection pools.

- A **new deploy** starts **new** function instances.
- **Old** instances are retired; their connections should close when those processes stop.
- The failure you saw was mostly **traffic shape**, not “deploy never closes”:
  - Opening the app in Admin → **burst of parallel requests**
  - Neon **compute asleep** (free tier idles after ~5 minutes) → first queries slow
  - Old setup: **5 connections per instance** + **10s pool timeout** → timeout → misleading `MissingSessionTableError`

A deploy can briefly add extra warm instances during rollout, but the main issue was **parallel Admin load + large per-instance pool**, not abandoned deploys holding connections forever.

## Neon: two URLs (you already have this)

From Neon Console:

| Variable | Host | Use |
|----------|------|-----|
| `DATABASE_URL` | `…-pooler.….neon.tech` | **Runtime** — app queries through PgBouncer |
| `DIRECT_URL` | `….neon.tech` (no `-pooler`) | **Migrations** — `prisma migrate deploy`, introspection |

References:

- [Connect from Prisma to Neon](https://neon.com/docs/guides/prisma)
- [Neon on Prisma docs](https://www.prisma.io/docs/orm/v6/overview/databases/neon)
- [Prisma connection pool (v6)](https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/databases-connections/connection-pool)
- [Connecting to Neon from Vercel](https://neon.com/docs/guides/vercel-connection-methods)

You cannot remove all limits: Neon and serverless always cap connections. The goal is to use **one connection per Vercel instance** and Neon’s **pooler** so many instances share fewer real Postgres sessions.

## Safe `DATABASE_URL` query parameters (Prisma 6)

You **can** add Prisma pool settings directly on the connection string. They apply to **Prisma Client** (not Neon’s pooler). This project uses Prisma **6.x**, which supports these URL parameters ([connection pool docs](https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/databases-connections/connection-pool), [Neon + Prisma](https://www.prisma.io/docs/orm/v6/overview/databases/neon)).

| Parameter | Meaning | Recommended (Vercel + Neon pooled URL) |
|-----------|---------|----------------------------------------|
| `sslmode=require` | TLS to Postgres | **Yes** (Neon requires SSL) |
| `connect_timeout` | Seconds to open a **new** TCP connection (Neon wake-up) | **15** (default 5 is often too short on free tier) |
| `pool_timeout` | Seconds to wait for a free slot in **Prisma’s** pool | **15** (default 10 caused your errors) |
| `connection_limit` | Max connections in **Prisma’s** pool **per Node process** | **1** on Vercel/serverless; **3–5** optional on local only |

Example **pooled** URL (app + Vercel env):

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=15&pool_timeout=15&connection_limit=1"
```

Example **direct** URL (migrations only — host **without** `-pooler`):

```env
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"
```

**Do not add on the pooled URL (usually):**

- `pgbouncer=true` — not needed for Neon’s modern pooler ([Prisma PgBouncer guide](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer)).
- `connection_limit=20` — Neon’s docs use that for **long-running** servers with heavy parallelism, not for **one connection per serverless instance**.

**Optional:** Neon Console sometimes adds `channel_binding=require`. You can keep it if Connect gave it to you; it is not required in the minimal examples above.

**Where params apply:**

- **Local dev** — Prisma reads `DATABASE_URL` from `.env` as-is (no Vercel helper). Putting `connection_limit=1` and timeouts in `.env` helps local match production.
- **Vercel** — `serverlessDatabaseUrl()` ensures `-pooler` and fills in any **missing** params with the same defaults; values you already set in Vercel `DATABASE_URL` are kept.

See also [`.env.example`](../.env.example) in the repo root.

## What we changed in this repo

### 1. `app/db.server.ts`

- **One `PrismaClient` per server process** via `global.prismaGlobal` (including on Vercel when the instance is warm).
- On Vercel (`VERCEL=1`), the client uses a tuned URL from `serverlessDatabaseUrl()`.

### 2. `app/lib/db/serverless-database-url.server.ts`

For production runtime on Vercel:

- `connection_limit=1` — one Prisma pool slot per function instance; parallel queries on that instance **queue** instead of opening five connections.
- `pool_timeout=15` and `connect_timeout=15` — more time when Neon wakes from sleep.
- Ensures Neon **`-pooler`** host when the URL is a direct Neon host.

### 3. `app/shopify.server.ts`

`PrismaSessionStorage` options:

- `connectionRetries: 3`
- `connectionRetryIntervalMs: 1000`

So a short delay while Neon activates compute is less likely to be treated as a missing `Session` table.

## Will you still get pool errors?

For **normal Shopify Admin use** (one shop, opening the embedded app), you should **not** see the same pattern:

- `Timed out fetching a new connection from the connection pool (limit: 5)`
- followed by **`MissingSessionTableError`**

That combination should be **gone or very rare** after deploying this code, with `DATABASE_URL` set in Vercel to the **pooled** Neon string.

**Still possible in edge cases** (free tier):

- Very high traffic → many **cold** instances each opening one connection at once → Neon or pooler limits.
- Long idle → first request slow (sluggish load, not necessarily 500).
- Wrong Vercel env (direct URL instead of pooler, missing `DATABASE_URL`).

The fix **removes the cause of the production failure you hit** (5-wide pool + parallel Admin requests + short timeout). It does **not** mean unlimited connections everywhere.

## Quick FAQ

| Question | Answer |
|----------|--------|
| Only my app uses the DB — why pool errors? | **One app**, but **many parallel requests** and **many Vercel instances**, each previously holding up to **5** Prisma connections. |
| Do deploys leave pools open? | **Not forever.** Old instances stop; the main issue was **concurrent load**, not eternal deploy leaks. |
| Is the issue fixed? | **For your case, in practice yes** — after deploy, Admin should load without that 500. Limits on Neon free tier still apply; the app is configured to use fewer connections per instance. |

## Verify after deploy

1. Redeploy to Vercel with these code changes.
2. Confirm Vercel **Production** env has `DATABASE_URL` = Neon **pooled** URL (`-pooler` in hostname).
3. Confirm migrations use direct URL (`DIRECT_URL` in schema / local `.env`; run `npm run setup` or `prisma migrate deploy` in CI/build if applicable).
4. Wait ~5+ minutes (Neon idle), then open the app in Shopify Admin.
5. If it fails, check Vercel logs for the **first** line mentioning `Error obtaining session table`, `P1001`, or `P2024` — not only `MissingSessionTableError`.

## Simple analogy (optional)

- **Database** = shop with a limited number of phone lines to the back office.
- **Neon pooler** = receptionist who shares a few back-office lines among many callers.
- **Prisma pool (old)** = each Vercel worker tried to keep **5** phones busy at once.
- **Shopify Admin** = many people calling at the same time when the page opens.
- **Fix** = each worker keeps **1** phone and reuses it; receptionist (Neon pooler) handles the rest.
