import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
export const createEntityNormalizationResult = (input) => {
    assertConfidence01(input.normalization_confidence, "normalization_confidence");
    if (input.normalized_entities.length === 0 && input.unresolved_entities.length === 0) {
        throw new ValidationError("INVALID_ENTITY_NORMALIZATION_RESULT", "at least one of normalized_entities or unresolved_entities must be non-empty");
    }
    return deepFreeze({
        ...input,
        normalized_entities: [...input.normalized_entities],
        unresolved_entities: [...input.unresolved_entities],
    });
};
//# sourceMappingURL=entity-normalization-result.entity.js.map