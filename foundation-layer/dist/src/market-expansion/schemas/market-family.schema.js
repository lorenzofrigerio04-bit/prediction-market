import { FamilyStatus } from "../enums/family-status.enum.js";
import { SourceContextType } from "../enums/source-context-type.enum.js";
export const MARKET_FAMILY_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/market-family.schema.json";
export const marketFamilySchema = {
    $id: MARKET_FAMILY_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "family_key",
        "source_context_type",
        "source_context_ref",
        "flagship_market_ref",
        "satellite_market_refs",
        "derivative_market_refs",
        "family_status",
        "family_metadata",
    ],
    properties: {
        id: { type: "string", pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        family_key: { type: "string", minLength: 1 },
        source_context_type: { type: "string", enum: Object.values(SourceContextType) },
        source_context_ref: { type: "string", minLength: 1 },
        flagship_market_ref: { type: "string", minLength: 1 },
        satellite_market_refs: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
        derivative_market_refs: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
        family_status: { type: "string", enum: Object.values(FamilyStatus) },
        family_metadata: {
            type: "object",
            additionalProperties: false,
            required: ["context_hash", "generation_mode", "tags", "notes"],
            properties: {
                context_hash: { type: "string", minLength: 1 },
                generation_mode: { type: "string", const: "deterministic-v1" },
                tags: { type: "array", items: { type: "string" } },
                notes: { type: "array", items: { type: "string" } },
            },
        },
    },
};
//# sourceMappingURL=market-family.schema.js.map