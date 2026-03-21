export type AdminCapabilityAction =
  | "events:create"
  | "events:resolve"
  | "events:moderate_comments"
  | "users:read"
  | "audit:read"
  | "pipeline:run";

export interface AdminCapabilityContext {
  userId?: string | null;
  role?: string | null;
}

export interface AdminCapabilityDecision {
  allowed: boolean;
  reason?: string;
  actorType: "ADMIN" | "SYSTEM" | "DENY";
}

const ADMIN_ACTIONS = new Set<AdminCapabilityAction>([
  "events:create",
  "events:resolve",
  "events:moderate_comments",
  "users:read",
  "audit:read",
  "pipeline:run",
]);

export function evaluateAdminCapability(
  action: AdminCapabilityAction,
  context: AdminCapabilityContext
): AdminCapabilityDecision {
  if (!ADMIN_ACTIONS.has(action)) {
    return {
      allowed: false,
      actorType: "DENY",
      reason: `Unknown action: ${action}`,
    };
  }

  if (context.role === "ADMIN") {
    return { allowed: true, actorType: "ADMIN" };
  }

  return {
    allowed: false,
    actorType: "DENY",
    reason: "Accesso negato: richiesti privilegi admin",
  };
}
