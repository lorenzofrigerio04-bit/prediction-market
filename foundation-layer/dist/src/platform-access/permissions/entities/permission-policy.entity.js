import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionKey } from "../../enums/action-key.enum.js";
import { PolicyStatus } from "../../enums/policy-status.enum.js";
export const createPermissionPolicy = (input) => {
    if (!Object.values(PolicyStatus).includes(input.policy_status)) {
        throw new ValidationError("INVALID_PERMISSION_POLICY", "policy_status is invalid");
    }
    if (input.allowed_actions.length === 0) {
        throw new ValidationError("INVALID_PERMISSION_POLICY", "allowed_actions must not be empty");
    }
    for (const action of input.allowed_actions) {
        if (!Object.values(ActionKey).includes(action)) {
            throw new ValidationError("INVALID_PERMISSION_POLICY", "allowed_actions contains invalid action");
        }
    }
    for (const deniedAction of input.denied_actions_nullable ?? []) {
        if (!Object.values(ActionKey).includes(deniedAction)) {
            throw new ValidationError("INVALID_PERMISSION_POLICY", "denied_actions_nullable contains invalid action");
        }
    }
    return deepFreeze({
        ...input,
        allowed_actions: deepFreeze([...input.allowed_actions]),
        denied_actions_nullable: input.denied_actions_nullable === null ? null : deepFreeze([...input.denied_actions_nullable]),
        scope_constraints: deepFreeze([...input.scope_constraints]),
    });
};
//# sourceMappingURL=permission-policy.entity.js.map