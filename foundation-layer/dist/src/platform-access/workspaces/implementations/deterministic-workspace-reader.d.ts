import type { Workspace } from "../entities/workspace.entity.js";
import type { WorkspaceReader } from "../interfaces/workspace-reader.js";
import type { WorkspaceId } from "../../value-objects/platform-access-ids.vo.js";
export declare class DeterministicWorkspaceReader implements WorkspaceReader {
    private readonly byId;
    constructor(workspaces: readonly Workspace[]);
    getById(workspaceId: WorkspaceId): Workspace | null;
}
//# sourceMappingURL=deterministic-workspace-reader.d.ts.map