import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt, type ValidationOptions } from "../../validators/common/validation-result.js";
import type { AdminGovernanceCompatibilityView } from "../compatibility/entities/admin-governance-compatibility-view.entity.js";

export const validateAdminGovernanceDenyFirstInvariants = (
  views: readonly AdminGovernanceCompatibilityView[],
  options?: ValidationOptions,
): ValidationReport => {
  const issues: ValidationIssue[] = [];
  for (const view of views) {
    for (const operation of view.allowed_operations) {
      if (view.denied_operations.includes(operation)) {
        issues.push(
          errorIssue(
            "AGGREGATE_DENY_FIRST_CONFLICT",
            "/allowed_operations",
            "allowed operation cannot also exist in denied_operations",
            { compatibilityViewId: view.id, operation },
          ),
        );
      }
    }
  }
  return buildValidationReport("AdminGovernanceDenyFirstInvariants", "admin-governance-deny-first", issues, resolveGeneratedAt(options));
};
