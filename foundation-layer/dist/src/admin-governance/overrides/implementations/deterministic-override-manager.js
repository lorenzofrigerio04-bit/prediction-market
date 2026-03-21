export class DeterministicOverrideManager {
    byId = new Map();
    submit(request) {
        this.byId.set(request.id, request);
        return request;
    }
    resolve(requestId, status, resolvedBy) {
        const existing = this.byId.get(requestId);
        if (existing === undefined) {
            return null;
        }
        const updated = {
            ...existing,
            status,
            resolved_by_nullable: resolvedBy,
        };
        this.byId.set(requestId, updated);
        return updated;
    }
    getById(requestId) {
        return this.byId.get(requestId) ?? null;
    }
}
//# sourceMappingURL=deterministic-override-manager.js.map