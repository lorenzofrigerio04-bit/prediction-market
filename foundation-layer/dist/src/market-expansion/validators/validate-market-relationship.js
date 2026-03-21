import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { RelationshipStrength } from "../enums/relationship-strength.enum.js";
import { MARKET_RELATIONSHIP_SCHEMA_ID } from "../schemas/market-relationship.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.source_market_ref === input.target_market_ref) {
        issues.push(errorIssue("RELATION_SELF_TARGET", "/", "source_market_ref and target_market_ref must differ"));
    }
    if (input.blocking_cannibalization &&
        ![RelationshipStrength.HIGH, RelationshipStrength.CRITICAL].includes(input.relationship_strength)) {
        issues.push(errorIssue("RELATION_BLOCKING_STRENGTH_INCOHERENT", "/relationship_strength", "blocking_cannibalization=true requires relationship_strength high or critical"));
    }
    return issues;
};
export const validateMarketRelationship = (input, options) => {
    const schemaValidator = requireSchemaValidator(MARKET_RELATIONSHIP_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("MarketRelationship", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-market-relationship.js.map