import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { GovernanceAuditLink } from "../audit-links/entities/governance-audit-link.entity.js";
import type { GovernanceDecision } from "../decisions/entities/governance-decision.entity.js";
import type { AdminFeatureFlag } from "../feature-flags/entities/admin-feature-flag.entity.js";
export type AdminGovernanceAuditAggregate = Readonly<{
    featureFlags: readonly AdminFeatureFlag[];
    decisions: readonly GovernanceDecision[];
    auditLinks: readonly GovernanceAuditLink[];
}>;
export declare const validateAdminGovernanceAuditInvariants: (aggregate: AdminGovernanceAuditAggregate, options?: ValidationOptions) => ValidationReport;
//# sourceMappingURL=validate-admin-governance-audit-invariants.d.ts.map