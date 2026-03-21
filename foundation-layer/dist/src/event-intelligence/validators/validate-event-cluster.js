import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { EVENT_CLUSTER_SCHEMA_ID } from "../schemas/event-cluster.schema.js";
const validateEventClusterInvariants = (input) => {
    const issues = [];
    if (input.candidate_ids.length === 0) {
        issues.push(errorIssue("MISSING_CLUSTER_CANDIDATES", "/candidate_ids", "candidate_ids must contain at least one candidate id"));
    }
    if (new Set(input.candidate_ids).size !== input.candidate_ids.length) {
        issues.push(errorIssue("DUPLICATE_CLUSTER_CANDIDATE", "/candidate_ids", "candidate_ids must be unique"));
    }
    return issues;
};
export const validateEventCluster = (input, options) => {
    const schemaValidator = requireSchemaValidator(EVENT_CLUSTER_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateEventClusterInvariants(input)];
    return buildValidationReport("EventCluster", input.cluster_id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-event-cluster.js.map