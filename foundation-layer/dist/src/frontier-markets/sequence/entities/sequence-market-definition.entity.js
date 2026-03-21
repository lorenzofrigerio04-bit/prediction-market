import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { CompletionPolicy } from "../../enums/completion-policy.enum.js";
import { RequiredOrderPolicy } from "../../enums/required-order-policy.enum.js";
import { SequenceValidationStatus } from "../../enums/sequence-validation-status.enum.js";
import { createSequenceTarget } from "./sequence-target.entity.js";
export const createSequenceMarketDefinition = (input) => {
    if (!Object.values(RequiredOrderPolicy).includes(input.required_order_policy)) {
        throw new ValidationError("INVALID_SEQUENCE_MARKET_DEFINITION", "required_order_policy is invalid");
    }
    if (!Object.values(CompletionPolicy).includes(input.completion_policy)) {
        throw new ValidationError("INVALID_SEQUENCE_MARKET_DEFINITION", "completion_policy is invalid");
    }
    if (!Object.values(SequenceValidationStatus).includes(input.sequence_validation_status)) {
        throw new ValidationError("INVALID_SEQUENCE_MARKET_DEFINITION", "sequence_validation_status is invalid");
    }
    if (input.sequence_targets.length < 2) {
        throw new ValidationError("INVALID_SEQUENCE_MARKET_DEFINITION", "sequence_targets must have at least 2 items");
    }
    return deepFreeze({
        ...input,
        sequence_targets: input.sequence_targets.map(createSequenceTarget),
        metadata: { ...input.metadata },
    });
};
//# sourceMappingURL=sequence-market-definition.entity.js.map