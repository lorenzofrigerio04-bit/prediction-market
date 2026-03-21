import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt } from "../../validators/common/validation-result.js";
export const validateAdminGovernanceAuditInvariants = (aggregate, options) => {
    const issues = [];
    const decisionByAudit = new Set(aggregate.decisions.map((decision) => decision.audit_ref));
    const flagByAudit = new Set(aggregate.featureFlags.map((flag) => flag.audit_ref));
    for (const link of aggregate.auditLinks) {
        const hasAudit = decisionByAudit.has(link.audit_ref) || flagByAudit.has(link.audit_ref);
        if (!hasAudit) {
            issues.push(errorIssue("AGGREGATE_AUDIT_LINK_ORPHAN", "/audit_ref", "audit link must reference existing feature flag or decision audit_ref", { auditRef: link.audit_ref, auditLinkId: link.id }));
        }
    }
    return buildValidationReport("AdminGovernanceAuditInvariants", "admin-governance-audit", issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-admin-governance-audit-invariants.js.map