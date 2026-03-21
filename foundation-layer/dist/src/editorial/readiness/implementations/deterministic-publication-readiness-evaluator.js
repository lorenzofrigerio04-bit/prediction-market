import { FinalReadinessStatus } from "../../enums/final-readiness-status.enum.js";
import { createPublicationReadyArtifact, } from "../entities/publication-ready-artifact.entity.js";
export class DeterministicPublicationReadinessEvaluator {
    evaluate(input) {
        const unresolvedBlocking = input.queue_entry.blocking_flags.filter((item) => !item.is_resolved);
        const hasApproval = input.approvals.length > 0;
        const hasTerminalRejection = input.rejections.length > 0;
        const isApprovedState = input.artifact.final_readiness_status === FinalReadinessStatus.APPROVED;
        if (isApprovedState && !hasApproval) {
            throw new Error("READINESS_REQUIRES_APPROVAL");
        }
        if (isApprovedState && hasTerminalRejection) {
            throw new Error("READINESS_INCOMPATIBLE_WITH_REJECTION");
        }
        if (unresolvedBlocking.length > 0 && isApprovedState) {
            throw new Error("READINESS_BLOCKED_BY_UNRESOLVED_FLAGS");
        }
        return createPublicationReadyArtifact(input.artifact);
    }
}
//# sourceMappingURL=deterministic-publication-readiness-evaluator.js.map