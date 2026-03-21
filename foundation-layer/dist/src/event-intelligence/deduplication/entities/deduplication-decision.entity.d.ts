import type { CanonicalEventIntelligenceId, EventCandidateId } from "../../value-objects/event-intelligence-ids.vo.js";
import { DeduplicationDecisionType } from "../enums/deduplication-decision-type.enum.js";
export type DeduplicationDecision = Readonly<{
    candidate_id: EventCandidateId;
    canonical_event_id: CanonicalEventIntelligenceId;
    decision_type: DeduplicationDecisionType;
    decision_confidence: number;
}>;
export declare const createDeduplicationDecision: (input: DeduplicationDecision) => DeduplicationDecision;
//# sourceMappingURL=deduplication-decision.entity.d.ts.map