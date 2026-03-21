import { SatelliteRole } from "../enums/satellite-role.enum.js";
export const SATELLITE_MARKET_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/satellite-market-definition.schema.json";
export const satelliteMarketDefinitionSchema = {
    $id: SATELLITE_MARKET_DEFINITION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "parent_family_id",
        "parent_market_ref",
        "market_ref",
        "satellite_role",
        "dependency_notes_nullable",
        "active",
    ],
    properties: {
        id: { type: "string", pattern: "^msd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        parent_family_id: { type: "string", pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        parent_market_ref: { type: "string", minLength: 1 },
        market_ref: { type: "string", minLength: 1 },
        satellite_role: { type: "string", enum: Object.values(SatelliteRole) },
        dependency_notes_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
        active: { type: "boolean" },
    },
};
//# sourceMappingURL=satellite-market-definition.schema.js.map