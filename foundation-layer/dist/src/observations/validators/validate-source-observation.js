import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { SOURCE_OBSERVATION_SCHEMA_ID } from "../schemas/source-observation.schema.js";
const validateSourceObservationInvariants = (input) => {
    const issues = [];
    if (Date.parse(input.ingestedAt) < Date.parse(input.observedAt)) {
        issues.push(errorIssue("INVALID_TEMPORAL_ORDER", "/ingestedAt", "ingestedAt must be greater than or equal to observedAt"));
    }
    if (input.evidenceSpans.length === 0) {
        issues.push(errorIssue("MISSING_EVIDENCE_SPANS", "/evidenceSpans", "evidenceSpans must contain at least one evidence span"));
    }
    if (input.traceabilityMetadata.mappingStrategyIds.length === 0) {
        issues.push(errorIssue("INVALID_TRACEABILITY_METADATA", "/traceabilityMetadata/mappingStrategyIds", "mappingStrategyIds must be non-empty"));
    }
    for (const [index, span] of input.evidenceSpans.entries()) {
        if (span.startOffset !== null &&
            span.endOffset !== null &&
            (span.startOffset < 0 || span.endOffset < span.startOffset)) {
            issues.push(errorIssue("INVALID_EVIDENCE_SPAN_OFFSETS", `/evidenceSpans/${index}`, "evidence span offsets must satisfy 0 <= startOffset <= endOffset"));
        }
    }
    return issues;
};
export const validateSourceObservation = (input, options) => {
    const schemaValidator = requireSchemaValidator(SOURCE_OBSERVATION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateSourceObservationInvariants(input)];
    return buildValidationReport("SourceObservation", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-source-observation.js.map