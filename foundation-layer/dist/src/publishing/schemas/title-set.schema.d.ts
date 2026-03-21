import { TitleGenerationStatus } from "../enums/title-generation-status.enum.js";
export declare const TITLE_SET_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/title-set.schema.json";
export declare const titleSetSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/title-set.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "canonical_title", "display_title", "subtitle", "title_generation_status", "generation_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^tset_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly display_title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly subtitle: {
            readonly type: readonly ["string", "null"];
        };
        readonly title_generation_status: {
            readonly type: "string";
            readonly enum: TitleGenerationStatus[];
        };
        readonly generation_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
};
//# sourceMappingURL=title-set.schema.d.ts.map