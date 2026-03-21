import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
const uniqueValues = (values) => new Set(values).size === values.length;
export const createEventCandidate = (input) => {
    if (input.observation_ids.length === 0) {
        throw new ValidationError("INVALID_EVENT_CANDIDATE", "observation_ids must contain at least one observation");
    }
    if (!uniqueValues(input.observation_ids)) {
        throw new ValidationError("INVALID_EVENT_CANDIDATE", "observation_ids must be unique");
    }
    if (input.evidence_spans.length === 0) {
        throw new ValidationError("INVALID_EVENT_CANDIDATE", "evidence_spans must contain at least one evidence span");
    }
    if (input.category_candidate.trim().length === 0) {
        throw new ValidationError("INVALID_EVENT_CANDIDATE", "category_candidate must be non-empty");
    }
    assertConfidence01(input.extraction_confidence, "extraction_confidence");
    return deepFreeze({
        ...input,
        observation_ids: [...input.observation_ids],
        category_candidate: input.category_candidate.trim(),
        evidence_spans: [...input.evidence_spans],
    });
};
//# sourceMappingURL=event-candidate.entity.js.map