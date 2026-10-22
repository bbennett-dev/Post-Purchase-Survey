/**
 * Runtime Postgres URL for Vercel.
 *
 * Prisma's own pool defaults to `num_cpus * 2 + 1` connections and a 10 second
 * wait (https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/databases-connections/connection-pool).
 * On Vercel that was 5 connections. Each warm server keeps that pool, so a
 * burst of admin requests fills it while Neon's free compute is waking up.
 *
 * Neon wants the app on the `-pooler` host, which shares a few real database
 * sessions across many app servers, and a longer `connect_timeout` because
 * the free compute sleeps after 5 minutes
 * (https://www.prisma.io/docs/orm/v6/overview/databases/neon).
 * One Prisma connection per server is enough: later requests on that server
 * reuse it instead of opening another pool.
 */
export function serverlessDatabaseUrl(connectionString: string): string {
  const queryIndex = connectionString.indexOf("?");
  const base =
    queryIndex === -1
      ? connectionString
      : connectionString.slice(0, queryIndex);
  const params = new URLSearchParams(
    queryIndex === -1 ? "" : connectionString.slice(queryIndex + 1),
  );

  setDefaultParam(params, "connection_limit", "1");
  setDefaultParam(params, "pool_timeout", "15");
  setDefaultParam(params, "connect_timeout", "15");
  setDefaultParam(params, "sslmode", "require");

  return `${toNeonPoolerHost(base)}?${params.toString()}`;
}

function setDefaultParam(
  params: URLSearchParams,
  key: string,
  value: string,
): void {
  if (!params.has(key)) {
    params.set(key, value);
  }
}

/**
 * Neon serves the same database on two hosts. The host with `-pooler` is
 * PgBouncer. Prisma migrations stay on the direct host; the running app
 * should not.
 */
function toNeonPoolerHost(base: string): string {
  const at = base.lastIndexOf("@");
  if (at === -1) return base;

  const afterAt = base.slice(at + 1);
  const slash = afterAt.indexOf("/");
  const hostPort = slash === -1 ? afterAt : afterAt.slice(0, slash);
  const path = slash === -1 ? "" : afterAt.slice(slash);
  const colon = hostPort.lastIndexOf(":");
  const host = colon === -1 ? hostPort : hostPort.slice(0, colon);
  const port = colon === -1 ? "" : hostPort.slice(colon);

  if (!host.endsWith(".neon.tech")) return base;

  const [firstLabel, ...rest] = host.split(".");
  if (!firstLabel || firstLabel.endsWith("-pooler")) return base;

  const pooledHost = [`${firstLabel}-pooler`, ...rest].join(".");
  return `${base.slice(0, at + 1)}${pooledHost}${port}${path}`;
}
