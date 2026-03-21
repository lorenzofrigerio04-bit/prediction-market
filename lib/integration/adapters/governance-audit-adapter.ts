export interface LegacyAuditInput {
  action: string;
  entityType: string;
  entityId?: string | null;
  payload?: unknown;
}

export interface GovernanceAuditEvent {
  actionKey: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, unknown> | null;
}

function normalizeAuditDetails(payload?: unknown): Record<string, unknown> | null {
  if (payload == null) {
    return null;
  }

  if (Array.isArray(payload)) {
    return { items: payload };
  }

  if (typeof payload === "object") {
    return payload as Record<string, unknown>;
  }

  return { value: payload };
}

export function toGovernanceAuditEvent(
  input: LegacyAuditInput
): GovernanceAuditEvent {
  return {
    actionKey: input.action,
    targetType: input.entityType,
    targetId: input.entityId ?? null,
    details: normalizeAuditDetails(input.payload),
  };
}
