import { createPrefixedId } from "../../common/utils/id.js";
export const createObservationInterpretationId = (value) => createPrefixedId(value, "oint_", "ObservationInterpretationId");
export const createEventCandidateId = (value) => createPrefixedId(value, "ecnd_", "EventCandidateId");
export const createCanonicalEventIntelligenceId = (value) => createPrefixedId(value, "cevt_", "CanonicalEventIntelligenceId");
export const createEventGraphNodeId = (value) => createPrefixedId(value, "egnd_", "EventGraphNodeId");
export const createEventRelationId = (value) => createPrefixedId(value, "erel_", "EventRelationId");
export const createEventClusterId = (value) => createPrefixedId(value, "eclu_", "EventClusterId");
export const createEventConflictId = (value) => createPrefixedId(value, "ecfl_", "EventConflictId");
//# sourceMappingURL=event-intelligence-ids.vo.js.map