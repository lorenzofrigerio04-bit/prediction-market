import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { AdminFeatureFlag } from "../feature-flags/entities/admin-feature-flag.entity.js";
import type { GovernanceDecision } from "../decisions/entities/governance-decision.entity.js";
import type { GovernanceAuditLink } from "../audit-links/entities/governance-audit-link.entity.js";
import type { AdminGovernanceCompatibilityView } from "../compatibility/entities/admin-governance-compatibility-view.entity.js";
export type AdminGovernanceFamilyAggregate = Readonly<{
    featureFlags: readonly AdminFeatureFlag[];
    decisions: readonly GovernanceDecision[];
    auditLinks: readonly GovernanceAuditLink[];
    compatibilityViews: readonly AdminGovernanceCompatibilityView[];
}>;
export declare const validateAdminGovernanceFamilyAggregate: (aggregate: AdminGovernanceFamilyAggregate, options?: ValidationOptions) => ValidationReport;
//# sourceMappingURL=validate-admin-governance-family-aggregate.d.ts.map