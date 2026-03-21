import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
export const createObservationInterpretation = (input) => {
    assertConfidence01(input.semantic_confidence, "semantic_confidence");
    if (input.interpreted_entities.length === 0 &&
        input.interpreted_dates.length === 0 &&
        input.interpreted_numbers.length === 0 &&
        input.interpreted_claims.length === 0) {
        throw new ValidationError("INVALID_OBSERVATION_INTERPRETATION", "at least one interpreted_* collection must contain data");
    }
    return deepFreeze({
        ...input,
        interpreted_entities: [...input.interpreted_entities],
        interpreted_dates: [...input.interpreted_dates],
        interpreted_numbers: [...input.interpreted_numbers],
        interpreted_claims: [...input.interpreted_claims],
    });
};
//# sourceMappingURL=observation-interpretation.entity.js.map