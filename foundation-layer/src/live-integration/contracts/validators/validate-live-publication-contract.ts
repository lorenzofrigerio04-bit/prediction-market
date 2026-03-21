import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { ContractStatus } from "../../enums/contract-status.enum.js";
import type { LivePublicationContract } from "../entities/live-publication-contract.entity.js";
import { LIVE_PUBLICATION_CONTRACT_SCHEMA_ID } from "../../schemas/live-publication-contract.schema.js";

const validateLivePublicationContractInvariants = (
  input: LivePublicationContract,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.publication_package_id.trim().length === 0) {
    issues.push(
      errorIssue("PUBLICATION_PACKAGE_REQUIRED", "/publication_package_id", "publication_package_id is required"),
    );
  }
  if (input.canonical_contract_ref.trim().length === 0) {
    issues.push(
      errorIssue("CANONICAL_CONTRACT_REF_REQUIRED", "/canonical_contract_ref", "canonical_contract_ref is required"),
    );
  }
  if (input.contract_status === ContractStatus.READY && input.safety_checks.length === 0) {
    issues.push(
      errorIssue(
        "SAFETY_CHECKS_REQUIRED_FOR_READY",
        "/safety_checks",
        "READY live publication contract requires at least one safety check",
      ),
    );
  }
  return issues;
};

export const validateLivePublicationContract = (
  input: LivePublicationContract,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(LIVE_PUBLICATION_CONTRACT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateLivePublicationContractInvariants(input);
  return buildValidationReport(
    "LivePublicationContract",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
