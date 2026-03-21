import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createMetricThresholdMetadata = (input) => {
    const numbers = [
        input.threshold_min_nullable,
        input.threshold_max_nullable,
        input.threshold_target_nullable,
    ];
    for (const value of numbers) {
        if (value !== null && !Number.isFinite(value)) {
            throw new ValidationError("INVALID_METRIC_THRESHOLD_METADATA", "Threshold values must be finite numbers or null");
        }
    }
    if (input.threshold_min_nullable !== null &&
        input.threshold_max_nullable !== null &&
        input.threshold_min_nullable > input.threshold_max_nullable) {
        throw new ValidationError("INVALID_METRIC_THRESHOLD_METADATA", "threshold_min_nullable must be <= threshold_max_nullable");
    }
    return deepFreeze(input);
};
//# sourceMappingURL=metric-threshold-metadata.vo.js.map