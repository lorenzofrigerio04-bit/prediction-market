import {
  errorIssue,
  type ValidationIssue,
  type ValidationReport,
} from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { EventGraphNode } from "../graph/entities/event-graph-node.entity.js";
import { EVENT_GRAPH_NODE_SCHEMA_ID } from "../schemas/event-graph-node.schema.js";

const validateEventGraphNodeInvariants = (input: EventGraphNode): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const relationIds = [...input.incoming_relations, ...input.outgoing_relations];
  if (new Set(relationIds).size !== relationIds.length) {
    issues.push(
      errorIssue(
        "OVERLAPPING_GRAPH_RELATIONS",
        "/incoming_relations",
        "incoming_relations and outgoing_relations must not overlap",
      ),
    );
  }
  return issues;
};

export const validateEventGraphNode = (
  input: EventGraphNode,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(EVENT_GRAPH_NODE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateEventGraphNodeInvariants(input)];
  return buildValidationReport("EventGraphNode", input.id, issues, resolveGeneratedAt(options));
};
