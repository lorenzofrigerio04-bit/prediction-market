import { RulebookSectionType } from "../enums/rulebook-section-type.enum.js";
export declare const RULEBOOK_SECTION_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
export declare const rulebookSectionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "section_type", "title", "body", "ordering_index", "required"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rbsec_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly section_type: {
            readonly type: "string";
            readonly enum: RulebookSectionType[];
        };
        readonly title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly body: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly ordering_index: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly required: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=rulebook-section.schema.d.ts.map