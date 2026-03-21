import { OpportunityStatus } from "../enums/opportunity-status.enum.js";
export declare const OPPORTUNITY_ASSESSMENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/opportunity-assessment.schema.json";
export declare const opportunityAssessmentSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/opportunity-assessment.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "canonical_event_id", "opportunity_status", "relevance_score", "resolvability_score", "timeliness_score", "novelty_score", "audience_potential_score", "blocking_reasons", "recommendation_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^opp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly opportunity_status: {
            readonly type: "string";
            readonly enum: OpportunityStatus[];
        };
        readonly relevance_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly resolvability_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly timeliness_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly novelty_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly audience_potential_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly recommendation_notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
};
//# sourceMappingURL=opportunity-assessment.schema.d.ts.map