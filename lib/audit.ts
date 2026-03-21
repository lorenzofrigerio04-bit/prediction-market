import { PrismaClient } from "@prisma/client";
import { toGovernanceAuditEvent } from "@/lib/integration/adapters/governance-audit-adapter";

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
  const governanceEvent = toGovernanceAuditEvent({
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    payload: params.payload ?? null,
  });
  return prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: governanceEvent.actionKey,
      entityType: governanceEvent.targetType,
      entityId: governanceEvent.targetId,
      // Convert payload to JSON string for SQLite compatibility
      payload: governanceEvent.details ? JSON.stringify(governanceEvent.details) : null,
    },
  });
}
