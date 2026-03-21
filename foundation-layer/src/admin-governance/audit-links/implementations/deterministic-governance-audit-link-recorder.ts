import type { GovernanceAuditLink } from "../entities/governance-audit-link.entity.js";
import type { GovernanceAuditLinkRecorder } from "../interfaces/governance-audit-link-recorder.js";

export class DeterministicGovernanceAuditLinkRecorder implements GovernanceAuditLinkRecorder {
  private readonly items: GovernanceAuditLink[] = [];

  record(link: GovernanceAuditLink): GovernanceAuditLink {
    this.items.push(link);
    return link;
  }

  list(): readonly GovernanceAuditLink[] {
    return this.items;
  }
}
