import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { ContractType } from "../../enums/contract-type.enum.js";
import { OUTCOME_GENERATION_RESULT_SCHEMA_ID } from "../../schemas/outcome-generation-result.schema.js";
const hasRangeOverlap = (input) => {
    const ranges = input.outcomes
        .map((outcome) => outcome.range_definition_nullable)
        .filter((range) => range !== null)
        .sort((left, right) => left.min_inclusive - right.min_inclusive);
    for (let index = 1; index < ranges.length; index += 1) {
        const previous = ranges[index - 1];
        const current = ranges[index];
        if (current.min_inclusive < previous.max_exclusive) {
            return true;
        }
    }
    return false;
};
const validateOutcomeGenerationInvariants = (input) => {
    const issues = [];
    if (input.outcomes.length === 0) {
        issues.push(errorIssue("EMPTY_OUTCOMES", "/outcomes", "outcomes must not be empty"));
        return issues;
    }
    const keySet = new Set(input.outcomes.map((outcome) => outcome.outcome_key));
    if (keySet.size !== input.outcomes.length) {
        issues.push(errorIssue("DUPLICATE_OUTCOME_KEYS", "/outcomes", "outcome_key values must be unique"));
    }
    if (input.contract_type === ContractType.BINARY && input.outcomes.length !== 2) {
        issues.push(errorIssue("INVALID_BINARY_CARDINALITY", "/outcomes", "binary requires exactly 2 outcomes"));
    }
    if (input.contract_type === ContractType.MULTI_OUTCOME && input.outcomes.length < 2) {
        issues.push(errorIssue("INVALID_MULTI_OUTCOME_CARDINALITY", "/outcomes", "multi_outcome requires at least 2 outcomes"));
    }
    if (input.contract_type === ContractType.SCALAR_BRACKET) {
        if (input.outcomes.some((outcome) => outcome.range_definition_nullable === null)) {
            issues.push(errorIssue("INVALID_SCALAR_RANGE_STRUCTURE", "/outcomes", "scalar_bracket outcomes require range_definition_nullable"));
        }
        if (hasRangeOverlap(input)) {
            issues.push(errorIssue("OVERLAPPING_SCALAR_RANGES", "/outcomes", "scalar_bracket ranges must not overlap"));
        }
    }
    return issues;
};
export const validateOutcomeGenerationResult = (input, options) => {
    const schemaValidator = requireSchemaValidator(OUTCOME_GENERATION_RESULT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateOutcomeGenerationInvariants(input)];
    return buildValidationReport("OutcomeGenerationResult", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-outcome-generation-result.js.map