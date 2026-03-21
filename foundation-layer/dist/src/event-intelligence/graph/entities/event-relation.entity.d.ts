import type { CanonicalEventIntelligenceId, EventRelationId } from "../../value-objects/event-intelligence-ids.vo.js";
import { RelationType } from "../enums/relation-type.enum.js";
export type EventRelation = Readonly<{
    id: EventRelationId;
    source_event_id: CanonicalEventIntelligenceId;
    target_event_id: CanonicalEventIntelligenceId;
    relation_type: RelationType;
    relation_confidence: number;
}>;
export declare const createEventRelation: (input: EventRelation) => EventRelation;
//# sourceMappingURL=event-relation.entity.d.ts.map