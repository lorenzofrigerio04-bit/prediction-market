import type { EventCandidate } from "../../candidates/entities/event-candidate.entity.js";
import type { CanonicalEventIntelligence } from "../entities/canonical-event.entity.js";
export interface CanonicalEventBuilder {
    build(candidates: readonly EventCandidate[]): CanonicalEventIntelligence;
}
//# sourceMappingURL=canonical-event-builder.d.ts.map