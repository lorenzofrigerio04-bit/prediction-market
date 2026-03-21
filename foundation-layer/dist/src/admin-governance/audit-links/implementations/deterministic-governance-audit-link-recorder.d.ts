import type { GovernanceAuditLink } from "../entities/governance-audit-link.entity.js";
import type { GovernanceAuditLinkRecorder } from "../interfaces/governance-audit-link-recorder.js";
export declare class DeterministicGovernanceAuditLinkRecorder implements GovernanceAuditLinkRecorder {
    private readonly items;
    record(link: GovernanceAuditLink): GovernanceAuditLink;
    list(): readonly GovernanceAuditLink[];
}
//# sourceMappingURL=deterministic-governance-audit-link-recorder.d.ts.map