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
import { RelationType } from "../graph/enums/relation-type.enum.js";
import type { EventRelation } from "../graph/entities/event-relation.entity.js";
import { EVENT_RELATION_SCHEMA_ID } from "../schemas/event-relation.schema.js";

const SELF_RELATION_ALLOWED_TYPES = new Set<RelationType>([RelationType.TOPIC_SIMILARITY]);

const validateEventRelationInvariants = (input: EventRelation): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (
    input.source_event_id === input.target_event_id &&
    !SELF_RELATION_ALLOWED_TYPES.has(input.relation_type)
  ) {
    issues.push(
      errorIssue(
        "INVALID_SELF_RELATION",
        "/target_event_id",
        "source_event_id and target_event_id cannot be equal for this relation_type",
      ),
    );
  }
  return issues;
};

export const validateEventRelation = (
  input: EventRelation,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(EVENT_RELATION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateEventRelationInvariants(input)];
  return buildValidationReport("EventRelation", input.id, issues, resolveGeneratedAt(options));
};
