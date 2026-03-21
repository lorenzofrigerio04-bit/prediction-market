import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionKey } from "../../enums/action-key.enum.js";
import { DecisionStatus } from "../../enums/decision-status.enum.js";
export const createAuthorizationDecision = (input) => {
    if (!Object.values(ActionKey).includes(input.requested_action)) {
        throw new ValidationError("INVALID_AUTHORIZATION_DECISION", "requested_action is invalid");
    }
    if (!Object.values(DecisionStatus).includes(input.decision_status)) {
        throw new ValidationError("INVALID_AUTHORIZATION_DECISION", "decision_status is invalid");
    }
    if (input.decision_status === DecisionStatus.DENIED && input.blocking_reasons.length === 0) {
        throw new ValidationError("INVALID_AUTHORIZATION_DECISION", "DENIED decision requires at least one blocking reason");
    }
    if (input.decision_status === DecisionStatus.ALLOWED && input.blocking_reasons.length > 0) {
        throw new ValidationError("INVALID_AUTHORIZATION_DECISION", "ALLOWED decision must not include blocking reasons");
    }
    return deepFreeze({
        ...input,
        matched_roles: deepFreeze([...input.matched_roles]),
        matched_policies: deepFreeze([...input.matched_policies]),
        blocking_reasons: deepFreeze([...input.blocking_reasons]),
    });
};
//# sourceMappingURL=authorization-decision.entity.js.map