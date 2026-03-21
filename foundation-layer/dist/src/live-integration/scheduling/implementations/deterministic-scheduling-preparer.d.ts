import { type SchedulingCandidate } from "../entities/scheduling-candidate.entity.js";
import type { PrepareSchedulingCandidateInput, SchedulingPreparer } from "../interfaces/scheduling-preparer.js";
export declare class DeterministicSchedulingPreparer implements SchedulingPreparer {
    prepareSchedulingCandidate(input: PrepareSchedulingCandidateInput): SchedulingCandidate;
    evaluateSchedulingEligibility(input: SchedulingCandidate): Readonly<{
        targetType: string;
        targetId: string;
        isValid: boolean;
        issues: readonly import("../../../index.js").ValidationIssue[];
        generatedAt: import("../../../index.js").Timestamp;
    }>;
}
//# sourceMappingURL=deterministic-scheduling-preparer.d.ts.map