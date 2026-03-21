import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { RelationshipStrength } from "../enums/relationship-strength.enum.js";
import { MARKET_RELATIONSHIP_SCHEMA_ID } from "../schemas/market-relationship.schema.js";
import type { MarketRelationship } from "../relationships/entities/market-relationship.entity.js";

const validateInvariants = (input: MarketRelationship): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.source_market_ref === input.target_market_ref) {
    issues.push(
      errorIssue("RELATION_SELF_TARGET", "/", "source_market_ref and target_market_ref must differ"),
    );
  }
  if (
    input.blocking_cannibalization &&
    ![RelationshipStrength.HIGH, RelationshipStrength.CRITICAL].includes(input.relationship_strength)
  ) {
    issues.push(
      errorIssue(
        "RELATION_BLOCKING_STRENGTH_INCOHERENT",
        "/relationship_strength",
        "blocking_cannibalization=true requires relationship_strength high or critical",
      ),
    );
  }
  return issues;
};

export const validateMarketRelationship = (
  input: MarketRelationship,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(MARKET_RELATIONSHIP_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport(
    "MarketRelationship",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
