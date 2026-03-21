export class DeterministicGovernanceAuditLinkRecorder {
    items = [];
    record(link) {
        this.items.push(link);
        return link;
    }
    list() {
        return this.items;
    }
}
//# sourceMappingURL=deterministic-governance-audit-link-recorder.js.map