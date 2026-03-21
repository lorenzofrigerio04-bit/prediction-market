import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createFreshnessProfile = (input) => {
    const expectedUpdateFrequency = input.expectedUpdateFrequency.trim();
    if (expectedUpdateFrequency.length === 0) {
        throw new ValidationError("INVALID_EXPECTED_UPDATE_FREQUENCY", "expectedUpdateFrequency must be non-empty");
    }
    if (!Number.isInteger(input.freshnessTtl) || input.freshnessTtl < 0) {
        throw new ValidationError("INVALID_FRESHNESS_TTL", "freshnessTtl must be a non-negative integer (seconds)", { freshnessTtl: input.freshnessTtl });
    }
    return deepFreeze({
        expectedUpdateFrequency,
        freshnessTtl: input.freshnessTtl,
        recencyPriority: input.recencyPriority,
    });
};
//# sourceMappingURL=freshness-profile.vo.js.map