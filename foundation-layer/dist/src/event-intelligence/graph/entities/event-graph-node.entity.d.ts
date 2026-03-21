import type { CanonicalEventIntelligenceId, EventGraphNodeId, EventRelationId } from "../../value-objects/event-intelligence-ids.vo.js";
import type { GraphMetadata } from "../../value-objects/shared-domain.vo.js";
export type EventGraphNode = Readonly<{
    id: EventGraphNodeId;
    canonical_event_id: CanonicalEventIntelligenceId;
    incoming_relations: readonly EventRelationId[];
    outgoing_relations: readonly EventRelationId[];
    graph_metadata: GraphMetadata;
}>;
export declare const createEventGraphNode: (input: EventGraphNode) => EventGraphNode;
//# sourceMappingURL=event-graph-node.entity.d.ts.map