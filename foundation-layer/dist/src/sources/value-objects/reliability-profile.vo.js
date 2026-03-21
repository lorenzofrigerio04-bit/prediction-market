import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
const assertUnitRange = (value, field) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new ValidationError("INVALID_RELIABILITY_SCORE", `${field} must be within [0,1]`, { field, value });
    }
};
export const createReliabilityProfile = (input) => {
    assertUnitRange(input.authorityScore, "authorityScore");
    assertUnitRange(input.historicalStabilityScore, "historicalStabilityScore");
    return deepFreeze({
        authorityScore: input.authorityScore,
        historicalStabilityScore: input.historicalStabilityScore,
        resolutionEligibility: input.resolutionEligibility,
        conflictRiskLevel: input.conflictRiskLevel,
    });
};
//# sourceMappingURL=reliability-profile.vo.js.map