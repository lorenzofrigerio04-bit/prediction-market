import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { WorkspaceStatus } from "../../enums/workspace-status.enum.js";
import { WorkspaceType } from "../../enums/workspace-type.enum.js";
import type { WorkspaceId } from "../../value-objects/platform-access-ids.vo.js";
import type { WorkspaceKey } from "../../value-objects/workspace-key.vo.js";
import type { DisplayName } from "../../value-objects/display-name.vo.js";
import type { VersionTag } from "../../value-objects/version-tag.vo.js";

export type Workspace = Readonly<{
  id: WorkspaceId;
  version: VersionTag;
  workspace_key: WorkspaceKey;
  display_name: DisplayName;
  workspace_type: WorkspaceType;
  status: WorkspaceStatus;
  governance_metadata: Readonly<Record<string, unknown>>;
}>;

export const createWorkspace = (input: Workspace): Workspace => {
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
