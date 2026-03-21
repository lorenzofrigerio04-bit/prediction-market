import type { Workspace } from "../entities/workspace.entity.js";
import type { WorkspaceId } from "../../value-objects/platform-access-ids.vo.js";

export interface WorkspaceReader {
  getById(workspaceId: WorkspaceId): Workspace | null;
}
