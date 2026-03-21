import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt, type ValidationOptions } from "../../validators/common/validation-result.js";
import type { AdminFeatureFlag } from "../feature-flags/entities/admin-feature-flag.entity.js";
import type { GovernanceDecision } from "../decisions/entities/governance-decision.entity.js";
import type { GovernanceAuditLink } from "../audit-links/entities/governance-audit-link.entity.js";
import type { AdminGovernanceCompatibilityView } from "../compatibility/entities/admin-governance-compatibility-view.entity.js";
import { validateAdminGovernanceDenyFirstInvariants } from "./validate-admin-governance-deny-first-invariants.js";
import { validateAdminGovernanceAuditInvariants } from "./validate-admin-governance-audit-invariants.js";

export type AdminGovernanceFamilyAggregate = Readonly<{
  featureFlags: readonly AdminFeatureFlag[];
  decisions: readonly GovernanceDecision[];
  auditLinks: readonly GovernanceAuditLink[];
  compatibilityViews: readonly AdminGovernanceCompatibilityView[];
}>;

export const validateAdminGovernanceFamilyAggregate = (
  aggregate: AdminGovernanceFamilyAggregate,
  options?: ValidationOptions,
): ValidationReport => {
  const denyReport = validateAdminGovernanceDenyFirstInvariants(aggregate.compatibilityViews, options);
  const auditReport = validateAdminGovernanceAuditInvariants(
    {
      featureFlags: aggregate.featureFlags,
      decisions: aggregate.decisions,
      auditLinks: aggregate.auditLinks,
    },
    options,
  );
  return buildValidationReport(
    "AdminGovernanceFamilyAggregate",
    "admin-governance-family",
    [...denyReport.issues, ...auditReport.issues],
    resolveGeneratedAt(options),
  );
};
