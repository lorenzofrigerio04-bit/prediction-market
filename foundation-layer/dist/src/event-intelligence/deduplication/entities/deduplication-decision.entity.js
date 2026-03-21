import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ValidationError } from "../../../common/errors/validation-error.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
export const createDeduplicationDecision = (input) => {
    if (input.candidate_id.length === 0 || input.canonical_event_id.length === 0) {
        throw new ValidationError("INVALID_DEDUPLICATION_DECISION", "candidate_id and canonical_event_id must be present");
    }
    assertConfidence01(input.decision_confidence, "decision_confidence");
    return deepFreeze(input);
};
//# sourceMappingURL=deduplication-decision.entity.js.map