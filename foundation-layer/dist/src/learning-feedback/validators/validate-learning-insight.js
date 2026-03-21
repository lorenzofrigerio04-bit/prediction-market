import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { LEARNING_INSIGHT_SCHEMA_ID } from "../schemas/learning-insight.schema.js";
const validateInsightInvariants = (input) => {
    const issues = [];
    if (input.correlation_id.trim().length === 0) {
        issues.push(errorIssue("INSIGHT_CORRELATION_ID_REQUIRED", "/correlation_id", "correlation_id is required"));
    }
    if (input.supporting_refs.length === 0) {
        issues.push(errorIssue("INSIGHT_SUPPORTING_REFS_REQUIRED", "/supporting_refs", "supporting_refs must be non-empty"));
    }
    return issues;
};
export const validateLearningInsight = (input, options) => {
    const schemaValidator = requireSchemaValidator(LEARNING_INSIGHT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInsightInvariants(input);
    return buildValidationReport("LearningInsight", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-learning-insight.js.map