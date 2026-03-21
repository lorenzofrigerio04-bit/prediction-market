import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
export const createEventConflict = (input) => {
    if (input.canonical_event_id_nullable === null && input.candidate_id_nullable === null) {
        throw new ValidationError("INVALID_EVENT_CONFLICT", "canonical_event_id_nullable or candidate_id_nullable must be provided");
    }
    if (input.description.trim().length === 0) {
        throw new ValidationError("INVALID_EVENT_CONFLICT", "description must be non-empty");
    }
    assertConfidence01(input.confidence, "confidence");
    return deepFreeze({
        ...input,
        description: input.description.trim(),
        conflicting_fields: [...input.conflicting_fields],
        related_observation_ids: [...input.related_observation_ids],
    });
};
//# sourceMappingURL=event-conflict.entity.js.map