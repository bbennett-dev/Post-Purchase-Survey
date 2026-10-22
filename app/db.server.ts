import { PrismaClient } from "@prisma/client";
import { serverlessDatabaseUrl } from "./lib/db/serverless-database-url.server";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

/**
 * One Prisma Client for this server process.
 *
 * On Vercel the client is pointed at Neon’s pooler with a single connection.
 * A warm server reuses that connection. Local `shopify app dev` keeps Prisma’s
 * normal pool, because that process is not a burst of separate servers.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (process.env.VERCEL !== "1" || !connectionString) {
    return new PrismaClient();
  }

  return new PrismaClient({
    datasourceUrl: serverlessDatabaseUrl(connectionString),
  });
}

const prisma = global.prismaGlobal ?? createPrismaClient();
global.prismaGlobal = prisma;

export default prisma;
