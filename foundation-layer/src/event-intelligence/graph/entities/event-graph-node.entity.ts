import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type {
  CanonicalEventIntelligenceId,
  EventGraphNodeId,
  EventRelationId,
} from "../../value-objects/event-intelligence-ids.vo.js";
import type { GraphMetadata } from "../../value-objects/shared-domain.vo.js";

export type EventGraphNode = Readonly<{
  id: EventGraphNodeId;
  canonical_event_id: CanonicalEventIntelligenceId;
  incoming_relations: readonly EventRelationId[];
  outgoing_relations: readonly EventRelationId[];
  graph_metadata: GraphMetadata;
}>;

export const createEventGraphNode = (input: EventGraphNode): EventGraphNode => {
  const allRelations = [...input.incoming_relations, ...input.outgoing_relations];
  if (new Set(allRelations).size !== allRelations.length) {
    throw new ValidationError(
      "INVALID_EVENT_GRAPH_NODE",
      "incoming_relations and outgoing_relations must not overlap",
    );
  }
  return deepFreeze({
    ...input,
    incoming_relations: [...input.incoming_relations],
    outgoing_relations: [...input.outgoing_relations],
  });
};
