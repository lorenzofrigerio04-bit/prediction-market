import { RelationshipStrength } from "../enums/relationship-strength.enum.js";
import { RelationshipType } from "../enums/relationship-type.enum.js";
export declare const MARKET_RELATIONSHIP_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/market-relationship.schema.json";
export declare const marketRelationshipSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/market-relationship.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "source_market_ref", "target_market_ref", "relationship_type", "relationship_strength", "blocking_cannibalization", "notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mrl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly relationship_type: {
            readonly type: "string";
            readonly enum: RelationshipType[];
        };
        readonly relationship_strength: {
            readonly type: "string";
            readonly enum: RelationshipStrength[];
        };
        readonly blocking_cannibalization: {
            readonly type: "boolean";
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
    };
};
//# sourceMappingURL=market-relationship.schema.d.ts.map