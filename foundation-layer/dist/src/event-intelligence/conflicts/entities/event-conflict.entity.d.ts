import type { CanonicalEventIntelligenceId, EventCandidateId, EventConflictId } from "../../value-objects/event-intelligence-ids.vo.js";
import type { SourceObservationId } from "../../../observations/value-objects/source-observation-id.vo.js";
import type { ConflictDescriptor } from "../../value-objects/shared-domain.vo.js";
import { ConflictType } from "../enums/conflict-type.enum.js";
export type EventConflict = Readonly<{
    id: EventConflictId;
    canonical_event_id_nullable: CanonicalEventIntelligenceId | null;
    candidate_id_nullable: EventCandidateId | null;
    conflict_type: ConflictType;
    description: string;
    conflicting_fields: readonly ConflictDescriptor[];
    related_observation_ids: readonly SourceObservationId[];
    confidence: number;
}>;
export declare const createEventConflict: (input: EventConflict) => EventConflict;
//# sourceMappingURL=event-conflict.entity.d.ts.map