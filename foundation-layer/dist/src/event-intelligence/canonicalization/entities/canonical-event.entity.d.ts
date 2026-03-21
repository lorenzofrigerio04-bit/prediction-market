import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { SourceObservationId } from "../../../observations/value-objects/source-observation-id.vo.js";
import type { CanonicalEventIntelligenceId, EventCandidateId, EventClusterId, EventGraphNodeId } from "../../value-objects/event-intelligence-ids.vo.js";
import type { ActionReference, JurisdictionReference, ObjectReference, SubjectReference, TemporalWindow } from "../../value-objects/shared-domain.vo.js";
export type CanonicalEventIntelligence = Readonly<{
    id: CanonicalEventIntelligenceId;
    version: EntityVersion;
    subject: SubjectReference;
    action: ActionReference;
    object_nullable: ObjectReference | null;
    event_type: string;
    category: string;
    time_window: TemporalWindow;
    jurisdiction_nullable: JurisdictionReference | null;
    supporting_candidates: readonly EventCandidateId[];
    supporting_observations: readonly SourceObservationId[];
    conflicting_observations: readonly SourceObservationId[];
    canonicalization_confidence: number;
    dedupe_cluster_id: EventClusterId;
    graph_node_id_nullable: EventGraphNodeId | null;
}>;
export type CanonicalEvent = CanonicalEventIntelligence;
export declare const createCanonicalEventIntelligence: (input: CanonicalEventIntelligence) => CanonicalEventIntelligence;
export declare const createCanonicalEvent: (input: CanonicalEvent) => CanonicalEvent;
//# sourceMappingURL=canonical-event.entity.d.ts.map