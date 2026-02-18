import { PrismaClient } from "@prisma/client";

// Avoid creating multiple Prisma client instances in development
// This is important for Next.js hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * For serverless environments (Vercel + Neon) we must limit the connection pool
 * to avoid exhausting Neon's connection limit.
 *
 * - connection_limit=1   → each serverless function uses at most 1 connection
 * - pool_timeout=20      → wait up to 20s for a free connection before erroring
 * - connect_timeout=10   → TCP connect timeout
 *
 * Append these to your DATABASE_URL in .env.local if using direct Neon connections.
 * Alternatively, use Neon's connection pooling endpoint (pgBouncer) which handles
 * this at the infrastructure level — preferred for production.
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

