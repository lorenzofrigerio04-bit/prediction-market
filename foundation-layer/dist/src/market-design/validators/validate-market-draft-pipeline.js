import { errorIssue, } from "../../entities/validation-report.entity.js";
import { ContractType } from "../enums/contract-type.enum.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { MARKET_DRAFT_PIPELINE_SCHEMA_ID } from "../schemas/market-draft-pipeline.schema.js";
import { MarketType } from "../../enums/market-type.enum.js";
const toExpectedMarketType = (contractType) => {
    if (contractType === ContractType.BINARY) {
        return MarketType.BINARY;
    }
    if (contractType === ContractType.SCALAR_BRACKET) {
        return MarketType.NUMERIC;
    }
    return MarketType.CATEGORICAL;
};
const validateMarketDraftPipelineInvariants = (input) => {
    const issues = [];
    const canonicalEventId = input.canonical_event.id;
    if (input.opportunity_assessment.canonical_event_id !== canonicalEventId) {
        issues.push(errorIssue("CANONICAL_EVENT_ID_MISMATCH", "/opportunity_assessment/canonical_event_id", "opportunity_assessment.canonical_event_id must match canonical_event.id"));
    }
    if (input.contract_selection.canonical_event_id !== canonicalEventId) {
        issues.push(errorIssue("CANONICAL_EVENT_ID_MISMATCH", "/contract_selection/canonical_event_id", "contract_selection.canonical_event_id must match canonical_event.id"));
    }
    if (input.deadline_resolution.canonical_event_id !== canonicalEventId) {
        issues.push(errorIssue("CANONICAL_EVENT_ID_MISMATCH", "/deadline_resolution/canonical_event_id", "deadline_resolution.canonical_event_id must match canonical_event.id"));
    }
    if (input.source_hierarchy_selection.canonical_event_id !== canonicalEventId) {
        issues.push(errorIssue("CANONICAL_EVENT_ID_MISMATCH", "/source_hierarchy_selection/canonical_event_id", "source_hierarchy_selection.canonical_event_id must match canonical_event.id"));
    }
    if (input.contract_selection.selected_contract_type !== input.outcome_generation_result.contract_type) {
        issues.push(errorIssue("CONTRACT_TYPE_MISMATCH", "/outcome_generation_result/contract_type", "outcome_generation_result.contract_type must match contract_selection.selected_contract_type"));
    }
    const expectedMarketType = toExpectedMarketType(input.contract_selection.selected_contract_type);
    if (input.foundation_candidate_market.marketType !== expectedMarketType) {
        issues.push(errorIssue("MARKET_TYPE_MISMATCH", "/foundation_candidate_market/marketType", "foundation_candidate_market.marketType must be compatible with selected contract type"));
    }
    return issues;
};
export const validateMarketDraftPipeline = (input, options) => {
    const schemaValidator = requireSchemaValidator(MARKET_DRAFT_PIPELINE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateMarketDraftPipelineInvariants(input);
    return buildValidationReport("MarketDraftPipeline", input.foundation_candidate_market.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-market-draft-pipeline.js.map