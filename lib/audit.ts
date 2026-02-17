import { PrismaClient } from "@prisma/client";

export type AuditPayload = Record<string, unknown>;

/**
 * Scrive una voce in AuditLog (azioni admin).
 */
export async function createAuditLog(
  prisma: PrismaClient,
  params: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    payload?: AuditPayload | null;
  }
) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      // Convert payload to JSON string for SQLite compatibility
      payload: params.payload ? JSON.stringify(params.payload) : null,
    },
  });
}
