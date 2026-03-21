import { PublishableCandidateStatus } from "../enums/publishable-candidate-status.enum.js";
export const PUBLISHABLE_CANDIDATE_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/publishable-candidate.schema.json";
export const publishableCandidateSchema = {
    $id: PUBLISHABLE_CANDIDATE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "market_draft_pipeline_id",
        "title_set_id",
        "resolution_summary_id",
        "rulebook_compilation_id",
        "candidate_status",
        "structural_readiness_score",
        "blocking_issues",
        "warnings",
        "compatibility_metadata",
    ],
    properties: {
        id: { type: "string", pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        market_draft_pipeline_id: { type: "string", pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        title_set_id: { type: "string", pattern: "^tset_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        resolution_summary_id: { type: "string", pattern: "^rsum_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        rulebook_compilation_id: { type: "string", pattern: "^rbcmp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        candidate_status: { type: "string", enum: Object.values(PublishableCandidateStatus) },
        structural_readiness_score: { type: "number", minimum: 0, maximum: 100 },
        blocking_issues: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["code", "message", "path"],
                properties: {
                    code: { type: "string", minLength: 1 },
                    message: { type: "string", minLength: 1 },
                    path: { type: "string", minLength: 1 },
                },
            },
        },
        warnings: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["code", "message", "path"],
                properties: {
                    code: { type: "string", minLength: 1 },
                    message: { type: "string", minLength: 1 },
                    path: { type: "string", minLength: 1 },
                },
            },
        },
        compatibility_metadata: { type: "object", additionalProperties: true },
    },
};
//# sourceMappingURL=publishable-candidate.schema.js.map