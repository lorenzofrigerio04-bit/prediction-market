import { SatelliteRole } from "../enums/satellite-role.enum.js";
export declare const SATELLITE_MARKET_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/satellite-market-definition.schema.json";
export declare const satelliteMarketDefinitionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/satellite-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_family_id", "parent_market_ref", "market_ref", "satellite_role", "dependency_notes_nullable", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^msd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly parent_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly satellite_role: {
            readonly type: "string";
            readonly enum: SatelliteRole[];
        };
        readonly dependency_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=satellite-market-definition.schema.d.ts.map