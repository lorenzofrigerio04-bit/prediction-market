import { ArtifactType } from "../enums/artifact-type.enum.js";
export declare const ARTIFACT_INSPECTION_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/artifact-inspection-view.schema.json";
export declare const artifactInspectionViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/artifact-inspection-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "artifact_ref", "artifact_type", "structured_fields", "validation_snapshot", "compatibility_snapshot", "related_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^aiv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly artifact_ref: {
            readonly type: "string";
            readonly pattern: "^arf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly artifact_type: {
            readonly type: "string";
            readonly enum: ArtifactType[];
        };
        readonly structured_fields: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["key", "value_type", "value_summary"];
                readonly properties: {
                    readonly key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value_type: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value_summary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly validation_snapshot: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["is_valid", "issue_count", "blocking_issue_count"];
            readonly properties: {
                readonly is_valid: {
                    readonly type: "boolean";
                };
                readonly issue_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly blocking_issue_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly compatibility_snapshot: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["is_compatible", "incompatible_with", "lossy_fields"];
            readonly properties: {
                readonly is_compatible: {
                    readonly type: "boolean";
                };
                readonly incompatible_with: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly lossy_fields: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
        readonly related_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
    };
};
//# sourceMappingURL=artifact-inspection-view.schema.d.ts.map