import { type ValidationIssue, type ValidationReport, errorIssue } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { ResolutionSummary } from "../summaries/entities/resolution-summary.entity.js";
import { RESOLUTION_SUMMARY_SCHEMA_ID } from "../schemas/resolution-summary.schema.js";

const validateResolutionSummaryInvariants = (input: ResolutionSummary): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.one_line_resolution_summary.trim().length === 0) {
    issues.push(
      errorIssue(
        "EMPTY_RESOLUTION_SUMMARY",
        "/one_line_resolution_summary",
        "one_line_resolution_summary must be non-empty",
      ),
    );
  }
  if (!input.summary_basis.resolution_rule_ref || !input.summary_basis.source_hierarchy_ref || !input.summary_basis.deadline_ref) {
    issues.push(
      errorIssue(
        "INCOMPLETE_SUMMARY_BASIS",
        "/summary_basis",
        "summary_basis must include resolution_rule_ref, source_hierarchy_ref, and deadline_ref",
      ),
    );
  }
  if (!/^contract:[a-z_]+$/i.test(input.summary_basis.resolution_rule_ref)) {
    issues.push(
      errorIssue(
        "INVALID_RESOLUTION_RULE_REFERENCE",
        "/summary_basis/resolution_rule_ref",
        "resolution_rule_ref must follow deterministic contract:<rule> format",
      ),
    );
  }
  if (!/^shs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$/.test(input.summary_basis.source_hierarchy_ref)) {
    issues.push(
      errorIssue(
        "INVALID_SOURCE_HIERARCHY_REFERENCE",
        "/summary_basis/source_hierarchy_ref",
        "source_hierarchy_ref must reference a SourceHierarchySelection id",
      ),
    );
  }
  if (!/^dlr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$/.test(input.summary_basis.deadline_ref)) {
    issues.push(
      errorIssue(
        "INVALID_DEADLINE_REFERENCE",
        "/summary_basis/deadline_ref",
        "deadline_ref must reference a DeadlineResolution id",
      ),
    );
  }
  if (input.summary_basis.basis_points.length < 2) {
    issues.push(
      errorIssue(
        "INSUFFICIENT_SUMMARY_BASIS_POINTS",
        "/summary_basis/basis_points",
        "summary_basis.basis_points must include at least two structured basis points",
      ),
    );
  }
  if (!/\bresolve(s|d)?\b/i.test(input.one_line_resolution_summary)) {
    issues.push(
      errorIssue(
        "UNDERSPECIFIED_RESOLUTION_SUMMARY",
        "/one_line_resolution_summary",
        "one_line_resolution_summary must explicitly describe deterministic resolution behavior",
      ),
    );
  }
  return issues;
};

export const validateResolutionSummary = (
  input: ResolutionSummary,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(RESOLUTION_SUMMARY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateResolutionSummaryInvariants(input)];
  return buildValidationReport("ResolutionSummary", input.id, issues, resolveGeneratedAt(options));
};
