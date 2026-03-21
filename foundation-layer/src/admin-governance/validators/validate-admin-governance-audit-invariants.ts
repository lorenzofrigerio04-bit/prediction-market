import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt, type ValidationOptions } from "../../validators/common/validation-result.js";
import type { GovernanceAuditLink } from "../audit-links/entities/governance-audit-link.entity.js";
import type { GovernanceDecision } from "../decisions/entities/governance-decision.entity.js";
import type { AdminFeatureFlag } from "../feature-flags/entities/admin-feature-flag.entity.js";

export type AdminGovernanceAuditAggregate = Readonly<{
  featureFlags: readonly AdminFeatureFlag[];
  decisions: readonly GovernanceDecision[];
  auditLinks: readonly GovernanceAuditLink[];
}>;

export const validateAdminGovernanceAuditInvariants = (
  aggregate: AdminGovernanceAuditAggregate,
  options?: ValidationOptions,
): ValidationReport => {
  const issues: ValidationIssue[] = [];
  const decisionByAudit = new Set(aggregate.decisions.map((decision) => decision.audit_ref));
  const flagByAudit = new Set(aggregate.featureFlags.map((flag) => flag.audit_ref));
  for (const link of aggregate.auditLinks) {
    const hasAudit = decisionByAudit.has(link.audit_ref) || flagByAudit.has(link.audit_ref);
    if (!hasAudit) {
      issues.push(
        errorIssue(
          "AGGREGATE_AUDIT_LINK_ORPHAN",
          "/audit_ref",
          "audit link must reference existing feature flag or decision audit_ref",
          { auditRef: link.audit_ref, auditLinkId: link.id },
        ),
      );
    }
  }
  return buildValidationReport("AdminGovernanceAuditInvariants", "admin-governance-audit", issues, resolveGeneratedAt(options));
};
