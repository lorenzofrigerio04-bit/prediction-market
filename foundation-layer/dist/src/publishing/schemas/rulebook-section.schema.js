import { RulebookSectionType } from "../enums/rulebook-section-type.enum.js";
export const RULEBOOK_SECTION_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
export const rulebookSectionSchema = {
    $id: RULEBOOK_SECTION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["id", "section_type", "title", "body", "ordering_index", "required"],
    properties: {
        id: { type: "string", pattern: "^rbsec_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        section_type: { type: "string", enum: Object.values(RulebookSectionType) },
        title: { type: "string", minLength: 1 },
        body: { type: "string", minLength: 1 },
        ordering_index: { type: "integer", minimum: 0 },
        required: { type: "boolean" },
    },
};
//# sourceMappingURL=rulebook-section.schema.js.map