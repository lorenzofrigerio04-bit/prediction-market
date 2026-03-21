import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
import { RelationType } from "../enums/relation-type.enum.js";
const SELF_RELATION_ALLOWED_TYPES = new Set([RelationType.TOPIC_SIMILARITY]);
export const createEventRelation = (input) => {
    assertConfidence01(input.relation_confidence, "relation_confidence");
    if (input.source_event_id === input.target_event_id &&
        !SELF_RELATION_ALLOWED_TYPES.has(input.relation_type)) {
        throw new ValidationError("INVALID_EVENT_RELATION", "self relation is not allowed for this relation_type", { relation_type: input.relation_type });
    }
    return deepFreeze(input);
};
//# sourceMappingURL=event-relation.entity.js.map