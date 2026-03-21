import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
const hasUniqueValues = (values) => new Set(values).size === values.length;
export const createCanonicalEventIntelligence = (input) => {
    if (input.supporting_candidates.length === 0) {
        throw new ValidationError("INVALID_CANONICAL_EVENT", "supporting_candidates must contain at least one candidate");
    }
    if (input.supporting_observations.length === 0) {
        throw new ValidationError("INVALID_CANONICAL_EVENT", "supporting_observations must contain at least one observation");
    }
    if (!hasUniqueValues(input.supporting_candidates)) {
        throw new ValidationError("INVALID_CANONICAL_EVENT", "supporting_candidates must contain unique values");
    }
    if (!hasUniqueValues(input.supporting_observations)) {
        throw new ValidationError("INVALID_CANONICAL_EVENT", "supporting_observations must contain unique values");
    }
    if (input.event_type.trim().length === 0 || input.category.trim().length === 0) {
        throw new ValidationError("INVALID_CANONICAL_EVENT", "event_type and category must be non-empty");
    }
    assertConfidence01(input.canonicalization_confidence, "canonicalization_confidence");
    return deepFreeze({
        ...input,
        event_type: input.event_type.trim(),
        category: input.category.trim(),
        supporting_candidates: [...input.supporting_candidates],
        supporting_observations: [...input.supporting_observations],
        conflicting_observations: [...input.conflicting_observations],
    });
};
export const createCanonicalEvent = (input) => createCanonicalEventIntelligence(input);
//# sourceMappingURL=canonical-event.entity.js.map