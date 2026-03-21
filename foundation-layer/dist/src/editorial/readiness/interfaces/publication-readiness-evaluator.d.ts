import type { ApprovalDecision } from "../../decisions/entities/approval-decision.entity.js";
import type { RejectionDecision } from "../../decisions/entities/rejection-decision.entity.js";
import type { ReviewQueueEntry } from "../../queue/entities/review-queue-entry.entity.js";
import type { PublicationReadyArtifact } from "../entities/publication-ready-artifact.entity.js";
export type ReadinessEvaluationInput = Readonly<{
    queue_entry: ReviewQueueEntry;
    approvals: readonly ApprovalDecision[];
    rejections: readonly RejectionDecision[];
    artifact: PublicationReadyArtifact;
}>;
export interface PublicationReadinessEvaluator {
    evaluate(input: ReadinessEvaluationInput): PublicationReadyArtifact;
}
//# sourceMappingURL=publication-readiness-evaluator.d.ts.map