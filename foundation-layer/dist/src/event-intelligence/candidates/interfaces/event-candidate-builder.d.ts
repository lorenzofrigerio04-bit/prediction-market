import type { ObservationInterpretation } from "../../interpretation/entities/observation-interpretation.entity.js";
import type { EventCandidate } from "../entities/event-candidate.entity.js";
export interface EventCandidateBuilder {
    build(input: ObservationInterpretation | readonly ObservationInterpretation[]): EventCandidate;
}
//# sourceMappingURL=event-candidate-builder.d.ts.map