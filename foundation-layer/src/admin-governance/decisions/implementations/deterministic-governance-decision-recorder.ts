import type { GovernanceDecisionId, GovernanceModuleId } from "../../value-objects/admin-governance-ids.vo.js";
import type { GovernanceDecision } from "../entities/governance-decision.entity.js";
import type { GovernanceDecisionRecorder } from "../interfaces/governance-decision-recorder.js";

export class DeterministicGovernanceDecisionRecorder implements GovernanceDecisionRecorder {
  private readonly byId = new Map<GovernanceDecisionId, GovernanceDecision>();

  record(decision: GovernanceDecision): GovernanceDecision {
    this.byId.set(decision.id, decision);
    return decision;
  }

  getById(decisionId: GovernanceDecisionId): GovernanceDecision | null {
    return this.byId.get(decisionId) ?? null;
  }

  listByModule(moduleId: GovernanceModuleId): readonly GovernanceDecision[] {
    return [...this.byId.values()].filter((decision) => decision.module_id === moduleId);
  }
}
