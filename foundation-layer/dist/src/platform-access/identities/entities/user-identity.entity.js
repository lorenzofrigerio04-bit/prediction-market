import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { UserStatus } from "../../enums/user-status.enum.js";
import { UserType } from "../../enums/user-type.enum.js";
export const createUserIdentity = (input) => {
    if (!Object.values(UserType).includes(input.user_type)) {
        throw new ValidationError("INVALID_USER_IDENTITY", "user_type is invalid");
    }
    if (!Object.values(UserStatus).includes(input.status)) {
        throw new ValidationError("INVALID_USER_IDENTITY", "status is invalid");
    }
    return deepFreeze({
        ...input,
        capability_flags: deepFreeze([...input.capability_flags]),
        metadata: deepFreeze({ ...input.metadata }),
    });
};
//# sourceMappingURL=user-identity.entity.js.map