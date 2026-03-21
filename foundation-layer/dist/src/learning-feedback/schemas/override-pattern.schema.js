import { PatternStatus } from "../enums/pattern-status.enum.js";
import { OverrideType } from "../enums/override-type.enum.js";
export const OVERRIDE_PATTERN_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/override-pattern.schema.json";
export const overridePatternSchema = {
    $id: OVERRIDE_PATTERN_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["id", "status", "override_type", "supporting_refs"],
    properties: {
        id: { type: "string", pattern: "^lop_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        status: { type: "string", enum: Object.values(PatternStatus) },
        override_type: { type: "string", enum: Object.values(OverrideType) },
        supporting_refs: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
    },
};
//# sourceMappingURL=override-pattern.schema.js.map