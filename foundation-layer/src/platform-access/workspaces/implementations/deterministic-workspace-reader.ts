import type { Workspace } from "../entities/workspace.entity.js";
import type { WorkspaceReader } from "../interfaces/workspace-reader.js";
import type { WorkspaceId } from "../../value-objects/platform-access-ids.vo.js";

export class DeterministicWorkspaceReader implements WorkspaceReader {
  private readonly byId: ReadonlyMap<WorkspaceId, Workspace>;

  constructor(workspaces: readonly Workspace[]) {
    this.byId = new Map(workspaces.map((workspace) => [workspace.id, workspace]));
  }

  getById(workspaceId: WorkspaceId): Workspace | null {
    return this.byId.get(workspaceId) ?? null;
  }
}
