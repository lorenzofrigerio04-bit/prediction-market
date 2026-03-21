import { ComplianceFlag } from "../enums/compliance-flag.enum.js";
import { MarketVisibility } from "../enums/market-visibility.enum.js";
export declare const PUBLICATION_METADATA_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/publication-metadata.schema.json";
export declare const publicationMetadataSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-metadata.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["category", "tags", "jurisdiction", "display_priority", "market_visibility", "compliance_flags"];
    readonly properties: {
        readonly category: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly jurisdiction: {
            readonly type: "string";
            readonly pattern: "^[A-Z]{2,3}$";
        };
        readonly display_priority: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly market_visibility: {
            readonly type: "string";
            readonly enum: MarketVisibility[];
        };
        readonly compliance_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: ComplianceFlag[];
            };
        };
    };
};
//# sourceMappingURL=publication-metadata.schema.d.ts.map