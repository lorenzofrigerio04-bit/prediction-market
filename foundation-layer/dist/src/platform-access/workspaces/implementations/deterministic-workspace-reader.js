export class DeterministicWorkspaceReader {
    byId;
    constructor(workspaces) {
        this.byId = new Map(workspaces.map((workspace) => [workspace.id, workspace]));
    }
    getById(workspaceId) {
        return this.byId.get(workspaceId) ?? null;
    }
}
//# sourceMappingURL=deterministic-workspace-reader.js.map