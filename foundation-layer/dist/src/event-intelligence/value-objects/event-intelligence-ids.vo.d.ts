import type { Branded } from "../../common/types/branded.js";
export type ObservationInterpretationId = Branded<string, "ObservationInterpretationId">;
export type EventCandidateId = Branded<string, "EventCandidateId">;
export type CanonicalEventIntelligenceId = Branded<string, "CanonicalEventIntelligenceId">;
export type EventGraphNodeId = Branded<string, "EventGraphNodeId">;
export type EventRelationId = Branded<string, "EventRelationId">;
export type EventClusterId = Branded<string, "EventClusterId">;
export type EventConflictId = Branded<string, "EventConflictId">;
export declare const createObservationInterpretationId: (value: string) => ObservationInterpretationId;
export declare const createEventCandidateId: (value: string) => EventCandidateId;
export declare const createCanonicalEventIntelligenceId: (value: string) => CanonicalEventIntelligenceId;
export declare const createEventGraphNodeId: (value: string) => EventGraphNodeId;
export declare const createEventRelationId: (value: string) => EventRelationId;
export declare const createEventClusterId: (value: string) => EventClusterId;
export declare const createEventConflictId: (value: string) => EventConflictId;
//# sourceMappingURL=event-intelligence-ids.vo.d.ts.map