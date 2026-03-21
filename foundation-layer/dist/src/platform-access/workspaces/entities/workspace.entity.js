import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { WorkspaceStatus } from "../../enums/workspace-status.enum.js";
import { WorkspaceType } from "../../enums/workspace-type.enum.js";
export const createWorkspace = (input) => {
    if (!Object.values(WorkspaceType).includes(input.workspace_type)) {
        throw new ValidationError("INVALID_WORKSPACE", "workspace_type is invalid");
    }
    if (!Object.values(WorkspaceStatus).includes(input.status)) {
        throw new ValidationError("INVALID_WORKSPACE", "status is invalid");
    }
    return deepFreeze({
        ...input,
        governance_metadata: deepFreeze({ ...input.governance_metadata }),
    });
};
//# sourceMappingURL=workspace.entity.js.map