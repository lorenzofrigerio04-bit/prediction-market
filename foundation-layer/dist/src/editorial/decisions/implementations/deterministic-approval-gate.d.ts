import { type ApprovalDecision } from "../entities/approval-decision.entity.js";
import type { EditorialReview } from "../../reviews/entities/editorial-review.entity.js";
import type { ApprovalGate } from "../interfaces/approval-gate.js";
export declare class DeterministicApprovalGate implements ApprovalGate {
    approve(review: EditorialReview, decision: ApprovalDecision): ApprovalDecision;
}
//# sourceMappingURL=deterministic-approval-gate.d.ts.map