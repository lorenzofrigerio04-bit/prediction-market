import { ImprovementArtifactType } from "../enums/improvement-artifact-type.enum.js";
export declare const IMPROVEMENT_ARTIFACT_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/improvement-artifact.schema.json";
export declare const improvementArtifactSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/improvement-artifact.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "artifact_type", "derived_from_refs", "safety_constraints", "rollout_notes", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lia_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly artifact_type: {
            readonly type: "string";
            readonly enum: ImprovementArtifactType[];
        };
        readonly derived_from_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly safety_constraints: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly rollout_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
};
//# sourceMappingURL=improvement-artifact.schema.d.ts.map