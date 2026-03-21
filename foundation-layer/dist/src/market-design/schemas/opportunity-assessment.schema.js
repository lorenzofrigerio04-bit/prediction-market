import { OpportunityStatus } from "../enums/opportunity-status.enum.js";
export const OPPORTUNITY_ASSESSMENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/opportunity-assessment.schema.json";
export const opportunityAssessmentSchema = {
    $id: OPPORTUNITY_ASSESSMENT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "canonical_event_id",
        "opportunity_status",
        "relevance_score",
        "resolvability_score",
        "timeliness_score",
        "novelty_score",
        "audience_potential_score",
        "blocking_reasons",
        "recommendation_notes_nullable",
    ],
    properties: {
        id: { type: "string", pattern: "^opp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        canonical_event_id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
        },
        opportunity_status: { type: "string", enum: Object.values(OpportunityStatus) },
        relevance_score: { $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01" },
        resolvability_score: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
        timeliness_score: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
        novelty_score: { $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01" },
        audience_potential_score: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
        blocking_reasons: { type: "array", items: { type: "string", minLength: 1 } },
        recommendation_notes_nullable: { type: ["string", "null"] },
    },
};
//# sourceMappingURL=opportunity-assessment.schema.js.map