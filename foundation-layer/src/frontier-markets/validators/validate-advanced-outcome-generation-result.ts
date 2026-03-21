import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { FUTURE_CONTRACT_TYPES, type FutureContractType } from "../../market-design/enums/contract-type.enum.js";
import { OutcomeExclusivityPolicy } from "../../market-design/enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../../market-design/enums/outcome-exhaustiveness-policy.enum.js";
import { ADVANCED_OUTCOME_GENERATION_RESULT_SCHEMA_ID } from "../schemas/advanced-outcome-generation-result.schema.js";
import type { AdvancedOutcomeGenerationResult } from "../outcomes/entities/advanced-outcome-generation-result.entity.js";

const validateAdvancedOutcomeInvariants = (
  input: AdvancedOutcomeGenerationResult,
): readonly ValidationIssue[] => {
  const futureContractTypes = new Set<FutureContractType>(FUTURE_CONTRACT_TYPES);
  const issues: ValidationIssue[] = [];
  if (!futureContractTypes.has(input.contract_type)) {
    issues.push(
      errorIssue(
        "ADVANCED_OUTCOME_CONTRACT_TYPE_INVALID",
        "/contract_type",
        "contract_type must be a frontier advanced contract type",
      ),
    );
  }
  if (input.generated_outcomes.length === 0) {
    issues.push(
      errorIssue(
        "ADVANCED_OUTCOMES_EMPTY",
        "/generated_outcomes",
        "generated_outcomes must not be empty",
      ),
    );
    return issues;
  }
  const keys = new Set(input.generated_outcomes.map((outcome) => outcome.outcome_key));
  if (keys.size !== input.generated_outcomes.length) {
    issues.push(
      errorIssue(
        "ADVANCED_OUTCOME_KEYS_DUPLICATE",
        "/generated_outcomes",
        "generated outcome keys must be unique",
      ),
    );
  }
  if (
    input.exhaustiveness_policy === OutcomeExhaustivenessPolicy.EXHAUSTIVE &&
    input.exclusivity_policy !== OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE
  ) {
    issues.push(
      errorIssue(
        "ADVANCED_OUTCOME_POLICY_INCONSISTENT",
        "/exclusivity_policy",
        "exhaustive advanced outcomes must be mutually exclusive",
      ),
    );
  }
  return issues;
};

export const validateAdvancedOutcomeGenerationResult = (
  input: AdvancedOutcomeGenerationResult,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ADVANCED_OUTCOME_GENERATION_RESULT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateAdvancedOutcomeInvariants(input);
  return buildValidationReport(
    "AdvancedOutcomeGenerationResult",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
