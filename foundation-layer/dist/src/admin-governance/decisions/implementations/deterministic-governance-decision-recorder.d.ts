import type { GovernanceDecisionId, GovernanceModuleId } from "../../value-objects/admin-governance-ids.vo.js";
import type { GovernanceDecision } from "../entities/governance-decision.entity.js";
import type { GovernanceDecisionRecorder } from "../interfaces/governance-decision-recorder.js";
export declare class DeterministicGovernanceDecisionRecorder implements GovernanceDecisionRecorder {
    private readonly byId;
    record(decision: GovernanceDecision): GovernanceDecision;
    getById(decisionId: GovernanceDecisionId): GovernanceDecision | null;
    listByModule(moduleId: GovernanceModuleId): readonly GovernanceDecision[];
}
//# sourceMappingURL=deterministic-governance-decision-recorder.d.ts.map