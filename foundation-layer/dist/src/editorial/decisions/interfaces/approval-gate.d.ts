import type { ApprovalDecision } from "../entities/approval-decision.entity.js";
import type { EditorialReview } from "../../reviews/entities/editorial-review.entity.js";
export interface ApprovalGate {
    approve(review: EditorialReview, decision: ApprovalDecision): ApprovalDecision;
}
//# sourceMappingURL=approval-gate.d.ts.map