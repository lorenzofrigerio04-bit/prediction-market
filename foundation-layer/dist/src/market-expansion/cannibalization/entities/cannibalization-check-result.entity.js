import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { CannibalizationStatus } from "../../enums/cannibalization-status.enum.js";
import { createExpansionNote } from "../../value-objects/market-expansion-shared.vo.js";
export const createCannibalizationCheckResult = (input) => {
    if (!Object.values(CannibalizationStatus).includes(input.check_status)) {
        throw new ValidationError("INVALID_CANNIBALIZATION_CHECK_RESULT", "check_status is invalid");
    }
    if (input.check_status === CannibalizationStatus.BLOCKING &&
        input.blocking_conflicts.length === 0) {
        throw new ValidationError("INVALID_CANNIBALIZATION_CHECK_RESULT", "blocking check status requires at least one blocking conflict");
    }
    return deepFreeze({
        ...input,
        checked_market_pairs: deepFreeze(input.checked_market_pairs.map((pair) => deepFreeze({
            source_market_ref: pair.source_market_ref,
            target_market_ref: pair.target_market_ref,
        }))),
        blocking_conflicts: input.blocking_conflicts.map(createExpansionNote),
        warnings: input.warnings.map(createExpansionNote),
    });
};
//# sourceMappingURL=cannibalization-check-result.entity.js.map