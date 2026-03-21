import { buildValidationReport, resolveGeneratedAt } from "../../validators/common/validation-result.js";
import { validateAdminGovernanceDenyFirstInvariants } from "./validate-admin-governance-deny-first-invariants.js";
import { validateAdminGovernanceAuditInvariants } from "./validate-admin-governance-audit-invariants.js";
export const validateAdminGovernanceFamilyAggregate = (aggregate, options) => {
    const denyReport = validateAdminGovernanceDenyFirstInvariants(aggregate.compatibilityViews, options);
    const auditReport = validateAdminGovernanceAuditInvariants({
        featureFlags: aggregate.featureFlags,
        decisions: aggregate.decisions,
        auditLinks: aggregate.auditLinks,
    }, options);
    return buildValidationReport("AdminGovernanceFamilyAggregate", "admin-governance-family", [...denyReport.issues, ...auditReport.issues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-admin-governance-family-aggregate.js.map