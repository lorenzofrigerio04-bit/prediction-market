import { ArtifactType } from "../enums/artifact-type.enum.js";
export declare const PUBLICATION_ARTIFACT_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/publication-artifact.schema.json";
export declare const publicationArtifactSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-artifact.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["artifact_type", "artifact_ref", "integrity_hash", "required"];
    readonly properties: {
        readonly artifact_type: {
            readonly type: "string";
            readonly enum: ArtifactType[];
        };
        readonly artifact_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly integrity_hash: {
            readonly type: "string";
            readonly pattern: "^([a-fA-F0-9]{64}|sha256:[a-fA-F0-9]{64})$";
        };
        readonly required: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=publication-artifact.schema.d.ts.map