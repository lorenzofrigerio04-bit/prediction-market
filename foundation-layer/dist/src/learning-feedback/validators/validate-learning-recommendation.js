import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { RecommendationStatus } from "../enums/recommendation-status.enum.js";
import { LEARNING_RECOMMENDATION_SCHEMA_ID } from "../schemas/learning-recommendation.schema.js";
const validateRecommendationInvariants = (input) => {
    const issues = [];
    if (input.correlation_id.trim().length === 0) {
        issues.push(errorIssue("RECOMMENDATION_CORRELATION_ID_REQUIRED", "/correlation_id", "correlation_id is required"));
    }
    if (input.status === RecommendationStatus.READY && input.blocking_dependency_refs.length > 0) {
        issues.push(errorIssue("RECOMMENDATION_READY_WITH_BLOCKING_DEPENDENCIES", "/blocking_dependency_refs", "ready recommendation cannot have blocking_dependency_refs"));
    }
    return issues;
};
export const validateLearningRecommendation = (input, options) => {
    const schemaValidator = requireSchemaValidator(LEARNING_RECOMMENDATION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateRecommendationInvariants(input);
    return buildValidationReport("LearningRecommendation", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-learning-recommendation.js.map