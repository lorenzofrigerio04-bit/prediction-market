import type { GovernanceDecision } from "../entities/governance-decision.entity.js";
import type { GovernanceDecisionId, GovernanceModuleId } from "../../value-objects/admin-governance-ids.vo.js";
export interface GovernanceDecisionRecorder {
    record(decision: GovernanceDecision): GovernanceDecision;
    getById(decisionId: GovernanceDecisionId): GovernanceDecision | null;
    listByModule(moduleId: GovernanceModuleId): readonly GovernanceDecision[];
}
//# sourceMappingURL=governance-decision-recorder.d.ts.map