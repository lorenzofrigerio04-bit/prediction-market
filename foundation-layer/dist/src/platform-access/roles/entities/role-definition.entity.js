import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { RoleScopePolicy } from "../../enums/role-scope-policy.enum.js";
export const createRoleDefinition = (input) => {
    if (!Object.values(RoleScopePolicy).includes(input.role_scope_policy)) {
        throw new ValidationError("INVALID_ROLE_DEFINITION", "role_scope_policy is invalid");
    }
    if (input.permission_set.length === 0) {
        throw new ValidationError("INVALID_ROLE_DEFINITION", "permission_set must not be empty");
    }
    return deepFreeze({
        ...input,
        permission_set: deepFreeze([...input.permission_set]),
    });
};
//# sourceMappingURL=role-definition.entity.js.map