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
export declare const createWorkspace: (input: Workspace) => Workspace;
//# sourceMappingURL=workspace.entity.d.ts.map