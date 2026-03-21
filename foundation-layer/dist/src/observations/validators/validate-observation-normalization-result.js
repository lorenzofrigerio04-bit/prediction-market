import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { OBSERVATION_NORMALIZATION_RESULT_SCHEMA_ID } from "../schemas/observation-normalization-result.schema.js";
const validateObservationNormalizationResultInvariants = (input) => {
    const issues = [];
    const expectedComplete = input.traceabilityCompleteness.hasSourceReference &&
        input.traceabilityCompleteness.hasRawPayloadReference &&
        input.traceabilityCompleteness.hasEvidenceSpans &&
        input.traceabilityCompleteness.hasTraceabilityMetadata;
    if (input.traceabilityCompleteness.isComplete !== expectedComplete) {
        issues.push(errorIssue("TRACEABILITY_COMPLETENESS_MISMATCH", "/traceabilityCompleteness/isComplete", "isComplete must match explicit completeness flags"));
    }
    return issues;
};
export const validateObservationNormalizationResult = (input, options) => {
    const schemaValidator = requireSchemaValidator(OBSERVATION_NORMALIZATION_RESULT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateObservationNormalizationResultInvariants(input)];
    return buildValidationReport("ObservationNormalizationResult", input.observation.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-observation-normalization-result.js.map