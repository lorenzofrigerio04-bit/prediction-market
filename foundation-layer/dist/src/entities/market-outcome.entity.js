import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { CandidateOutcomeType } from "../enums/candidate-outcome-type.enum.js";
export const createMarketOutcome = (input) => {
    if (!Object.values(CandidateOutcomeType).includes(input.outcomeType)) {
        throw new ValidationError("INVALID_OUTCOME_TYPE", "outcomeType is invalid");
    }
    if (input.label.trim().length === 0) {
        throw new ValidationError("INVALID_OUTCOME_LABEL", "label must be non-empty");
    }
    if (!Number.isInteger(input.orderIndex) || input.orderIndex < 0) {
        throw new ValidationError("INVALID_OUTCOME_ORDER_INDEX", "orderIndex must be an integer >= 0", { value: input.orderIndex });
    }
    return deepFreeze({
        ...input,
        label: input.label.trim(),
        shortLabel: input.shortLabel?.trim() ?? null,
        description: input.description?.trim() ?? null,
    });
};
//# sourceMappingURL=market-outcome.entity.js.map