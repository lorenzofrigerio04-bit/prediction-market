import { ClaimPolarity } from "../../enums/claim-polarity.enum.js";
import { MarketResolutionBasis } from "../../enums/market-resolution-basis.enum.js";
export declare const STRUCTURED_CLAIM_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/structured-claim.schema.json";
export declare const structuredClaimSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/entities/structured-claim.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonicalEventId", "claimText", "normalizedClaimText", "polarity", "claimSubject", "claimPredicate", "claimObject", "resolutionBasis", "resolutionWindow", "confidenceScore", "sourceRecordIds", "tags", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/claimId";
        };
        readonly canonicalEventId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
        };
        readonly claimText: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly normalizedClaimText: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly polarity: {
            readonly type: "string";
            readonly enum: ClaimPolarity[];
        };
        readonly claimSubject: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly claimPredicate: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly claimObject: {
            readonly type: readonly ["string", "null"];
        };
        readonly resolutionBasis: {
            readonly type: "string";
            readonly enum: MarketResolutionBasis[];
        };
        readonly resolutionWindow: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["openAt", "closeAt"];
            readonly properties: {
                readonly openAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                };
                readonly closeAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                };
            };
        };
        readonly confidenceScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
        };
        readonly sourceRecordIds: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId";
            };
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag";
            };
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
};
//# sourceMappingURL=structured-claim.schema.d.ts.map