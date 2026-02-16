import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma client. In production (e.g. Vercel) each cold start gets a new instance.
 * To avoid "Error in PostgreSQL connection: Closed" use a pooled DATABASE_URL (Neon: host with "-pooler")
 * and add ?connection_limit=1 for serverless.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
