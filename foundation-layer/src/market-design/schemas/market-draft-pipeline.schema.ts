export const MARKET_DRAFT_PIPELINE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/market-design/market-draft-pipeline.schema.json";

export const marketDraftPipelineSchema = {
  $id: MARKET_DRAFT_PIPELINE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "canonical_event",
    "opportunity_assessment",
    "contract_selection",
    "outcome_generation_result",
    "deadline_resolution",
    "source_hierarchy_selection",
    "preliminary_scorecard",
    "foundation_candidate_market",
  ],
  properties: {
    canonical_event: {
      $ref: "https://market-design-engine.dev/schemas/event-intelligence/canonical-event.schema.json",
    },
    opportunity_assessment: {
      $ref: "https://market-design-engine.dev/schemas/market-design/opportunity-assessment.schema.json",
    },
    contract_selection: {
      $ref: "https://market-design-engine.dev/schemas/market-design/contract-selection.schema.json",
    },
    outcome_generation_result: {
      $ref: "https://market-design-engine.dev/schemas/market-design/outcome-generation-result.schema.json",
    },
    deadline_resolution: {
      $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json",
    },
    source_hierarchy_selection: {
      $ref: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json",
    },
    preliminary_scorecard: {
      $ref: "https://market-design-engine.dev/schemas/market-design/preliminary-scorecard.schema.json",
    },
    foundation_candidate_market: {
      $ref: "https://market-design-engine.dev/schemas/entities/candidate-market.schema.json",
    },
  },
} as const;
