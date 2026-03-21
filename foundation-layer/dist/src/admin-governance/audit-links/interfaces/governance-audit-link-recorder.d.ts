import type { GovernanceAuditLink } from "../entities/governance-audit-link.entity.js";
export interface GovernanceAuditLinkRecorder {
    record(link: GovernanceAuditLink): GovernanceAuditLink;
    list(): readonly GovernanceAuditLink[];
}
//# sourceMappingURL=governance-audit-link-recorder.d.ts.map