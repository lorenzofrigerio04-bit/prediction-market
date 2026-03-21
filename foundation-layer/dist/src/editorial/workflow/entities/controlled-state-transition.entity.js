import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
export const createControlledStateTransition = (input) => {
    if (input.from_state.trim().length === 0 ||
        input.to_state.trim().length === 0 ||
        input.transition_reason.trim().length === 0) {
        throw new ValidationError("INVALID_CONTROLLED_STATE_TRANSITION", "from_state, to_state, and transition_reason are required");
    }
    if (input.from_state === input.to_state) {
        throw new ValidationError("INVALID_CONTROLLED_STATE_TRANSITION", "from_state and to_state must differ");
    }
    return deepFreeze(input);
};
//# sourceMappingURL=controlled-state-transition.entity.js.map