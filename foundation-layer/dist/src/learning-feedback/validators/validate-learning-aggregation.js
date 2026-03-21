import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { LEARNING_AGGREGATION_SCHEMA_ID } from "../schemas/learning-aggregation.schema.js";
const validateAggregationInvariants = (input) => {
    const issues = [];
    if (input.correlation_id.trim().length === 0) {
        issues.push(errorIssue("AGGREGATION_CORRELATION_ID_REQUIRED", "/correlation_id", "correlation_id is required"));
    }
    if (input.input_signal_refs.length === 0) {
        issues.push(errorIssue("AGGREGATION_INPUT_SIGNAL_REFS_REQUIRED", "/input_signal_refs", "input_signal_refs must be non-empty"));
    }
    return issues;
};
export const validateLearningAggregation = (input, options) => {
    const schemaValidator = requireSchemaValidator(LEARNING_AGGREGATION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateAggregationInvariants(input);
    return buildValidationReport("LearningAggregation", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-learning-aggregation.js.map