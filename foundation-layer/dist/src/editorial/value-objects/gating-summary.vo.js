import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { FinalReadinessStatus } from "../enums/final-readiness-status.enum.js";
export const createGatingSummary = (input) => {
    if (!Object.values(FinalReadinessStatus).includes(input.readiness_status)) {
        throw new ValidationError("INVALID_GATING_SUMMARY", "gating summary has invalid readiness_status");
    }
    if (!Number.isInteger(input.unresolved_blocking_flags_count) || input.unresolved_blocking_flags_count < 0) {
        throw new ValidationError("INVALID_GATING_SUMMARY", "unresolved_blocking_flags_count must be a non-negative integer");
    }
    if (input.checks.length === 0 || input.checks.some((check) => check.trim().length === 0)) {
        throw new ValidationError("INVALID_GATING_SUMMARY", "gating checks must contain at least one non-empty item");
    }
    return deepFreeze({
        ...input,
        checks: deepFreeze([...input.checks]),
    });
};
//# sourceMappingURL=gating-summary.vo.js.map