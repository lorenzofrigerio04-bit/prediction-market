import { ValidationError } from "../../common/errors/validation-error.js";
export const createObservationConfidenceScore = (value) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new ValidationError("INVALID_OBSERVATION_CONFIDENCE_SCORE", "ObservationConfidenceScore must be within [0,1]", { value });
    }
    return value;
};
//# sourceMappingURL=confidence-score.vo.js.map