import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { EVENT_GRAPH_NODE_SCHEMA_ID } from "../schemas/event-graph-node.schema.js";
const validateEventGraphNodeInvariants = (input) => {
    const issues = [];
    const relationIds = [...input.incoming_relations, ...input.outgoing_relations];
    if (new Set(relationIds).size !== relationIds.length) {
        issues.push(errorIssue("OVERLAPPING_GRAPH_RELATIONS", "/incoming_relations", "incoming_relations and outgoing_relations must not overlap"));
    }
    return issues;
};
export const validateEventGraphNode = (input, options) => {
    const schemaValidator = requireSchemaValidator(EVENT_GRAPH_NODE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateEventGraphNodeInvariants(input)];
    return buildValidationReport("EventGraphNode", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-event-graph-node.js.map