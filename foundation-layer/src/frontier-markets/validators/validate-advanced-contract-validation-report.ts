import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { FUTURE_CONTRACT_TYPES, type FutureContractType } from "../../market-design/enums/contract-type.enum.js";
import { AdvancedValidationStatus } from "../enums/advanced-validation-status.enum.js";
import { ADVANCED_CONTRACT_VALIDATION_REPORT_SCHEMA_ID } from "../schemas/advanced-contract-validation-report.schema.js";
import type { AdvancedContractValidationReport } from "../validation/entities/advanced-contract-validation-report.entity.js";

const validateReportInvariants = (input: AdvancedContractValidationReport): readonly ValidationIssue[] => {
  const futureContractTypes = new Set<FutureContractType>(FUTURE_CONTRACT_TYPES);
  const issues: ValidationIssue[] = [];
  if (!futureContractTypes.has(input.contract_type)) {
    issues.push(
      errorIssue(
        "ADVANCED_REPORT_CONTRACT_TYPE_INVALID",
        "/contract_type",
        "contract_type must be a frontier advanced contract type",
      ),
    );
  }
  if (input.checked_invariants.length === 0) {
    issues.push(
      errorIssue(
        "ADVANCED_REPORT_INVARIANTS_EMPTY",
        "/checked_invariants",
        "checked_invariants must not be empty",
      ),
    );
  }
  if (input.validation_status === AdvancedValidationStatus.VALID && input.blocking_issues.length > 0) {
    issues.push(
      errorIssue(
        "ADVANCED_REPORT_STATUS_INCONSISTENT",
        "/validation_status",
        "validation_status cannot be valid when blocking_issues exist",
      ),
    );
  }
  if (input.validation_status === AdvancedValidationStatus.INVALID && input.blocking_issues.length === 0) {
    issues.push(
      errorIssue(
        "ADVANCED_REPORT_STATUS_INCONSISTENT",
        "/validation_status",
        "validation_status invalid requires at least one blocking issue",
      ),
    );
  }
  return issues;
};

export const validateAdvancedContractValidationReport = (
  input: AdvancedContractValidationReport,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ADVANCED_CONTRACT_VALIDATION_REPORT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateReportInvariants(input);
  return buildValidationReport(
    "AdvancedContractValidationReport",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
