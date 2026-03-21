import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
export const createRoleAssignment = (input) => {
    if (input.assigned_at.trim().length === 0) {
        throw new ValidationError("INVALID_ROLE_ASSIGNMENT", "assigned_at is required");
    }
    return deepFreeze({ ...input });
};
//# sourceMappingURL=role-assignment.entity.js.map