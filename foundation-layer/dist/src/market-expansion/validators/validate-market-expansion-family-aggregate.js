import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt } from "../../validators/common/validation-result.js";
import { CannibalizationStatus } from "../enums/cannibalization-status.enum.js";
const validateAggregateInvariants = (input) => {
    const issues = [];
    const familyMarketSet = new Set([
        input.family.flagship_market_ref,
        ...input.family.satellite_market_refs,
        ...input.family.derivative_market_refs,
    ]);
    if (input.family.flagship_market_ref !== input.flagship.selected_market_ref) {
        issues.push(errorIssue("FAMILY_FLAGSHIP_MISMATCH", "/family/flagship_market_ref", "family flagship_market_ref must match flagship selection"));
    }
    for (const satellite of input.satellites) {
        if (satellite.market_ref === input.family.flagship_market_ref) {
            issues.push(errorIssue("FAMILY_SATELLITE_EQUALS_FLAGSHIP", "/satellites", "satellite market cannot be equal to family flagship"));
        }
        if (!input.family.satellite_market_refs.includes(satellite.market_ref)) {
            issues.push(errorIssue("FAMILY_SATELLITE_NOT_DECLARED", "/satellites", "satellite market_ref must exist in family.satellite_market_refs"));
        }
    }
    for (const derivative of input.derivatives) {
        if (!input.family.derivative_market_refs.includes(derivative.market_ref)) {
            issues.push(errorIssue("FAMILY_DERIVATIVE_NOT_DECLARED", "/derivatives", "derivative market_ref must exist in family.derivative_market_refs"));
        }
    }
    if (input.cannibalization.check_status === CannibalizationStatus.BLOCKING &&
        input.cannibalization.blocking_conflicts.length > 0) {
        issues.push(errorIssue("FAMILY_BLOCKED_BY_CANNIBALIZATION", "/cannibalization", "family cannot be valid when blocking cannibalization conflicts exist"));
    }
    for (const derivative of input.derivatives) {
        if (derivative.source_relation_ref.startsWith("invalid_")) {
            issues.push(errorIssue("DERIVATIVE_SOURCE_RELATION_INVALID", "/derivatives", "derivative source relation is invalid"));
        }
    }
    for (const relationship of input.relationships) {
        if (!familyMarketSet.has(relationship.source_market_ref)) {
            issues.push(errorIssue("RELATIONSHIP_SOURCE_OUTSIDE_FAMILY", "/relationships", "relationship source market must belong to family"));
        }
        if (!familyMarketSet.has(relationship.target_market_ref)) {
            issues.push(errorIssue("RELATIONSHIP_TARGET_OUTSIDE_FAMILY", "/relationships", "relationship target market must belong to family"));
        }
    }
    if (input.cannibalization.family_id !== input.family.id) {
        issues.push(errorIssue("CANNIBALIZATION_FAMILY_ID_MISMATCH", "/cannibalization/family_id", "cannibalization.family_id must match family.id"));
    }
    for (const marketRef of input.family.satellite_market_refs) {
        if (input.family.derivative_market_refs.includes(marketRef)) {
            issues.push(errorIssue("FAMILY_CROSS_LIST_DUPLICATE_REFS", "/family", "satellite_market_refs and derivative_market_refs must not overlap"));
            break;
        }
    }
    if (input.relationships.length === 0) {
        issues.push(errorIssue("FAMILY_RELATIONSHIPS_MISSING", "/relationships", "at least one relationship is required for a coherent market family"));
    }
    return issues;
};
export const validateMarketExpansionFamilyAggregate = (input, options) => buildValidationReport("MarketExpansionFamilyAggregate", input.family.id, validateAggregateInvariants(input), resolveGeneratedAt(options));
//# sourceMappingURL=validate-market-expansion-family-aggregate.js.map