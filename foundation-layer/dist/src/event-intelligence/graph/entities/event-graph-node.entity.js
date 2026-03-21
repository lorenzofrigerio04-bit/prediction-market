import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
export const createEventGraphNode = (input) => {
    const allRelations = [...input.incoming_relations, ...input.outgoing_relations];
    if (new Set(allRelations).size !== allRelations.length) {
        throw new ValidationError("INVALID_EVENT_GRAPH_NODE", "incoming_relations and outgoing_relations must not overlap");
    }
    return deepFreeze({
        ...input,
        incoming_relations: [...input.incoming_relations],
        outgoing_relations: [...input.outgoing_relations],
    });
};
//# sourceMappingURL=event-graph-node.entity.js.map