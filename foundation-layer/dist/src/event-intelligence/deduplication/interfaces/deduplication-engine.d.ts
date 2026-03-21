import type { EventCandidate } from "../../candidates/entities/event-candidate.entity.js";
import type { CanonicalEventIntelligence } from "../../canonicalization/entities/canonical-event.entity.js";
import type { DeduplicationDecision } from "../entities/deduplication-decision.entity.js";
export interface DeduplicationEngine {
    decide(candidate: EventCandidate, canonicalEvents: readonly CanonicalEventIntelligence[]): DeduplicationDecision;
}
//# sourceMappingURL=deduplication-engine.d.ts.map