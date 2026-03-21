export declare const NORMALIZED_DISCOVERY_PAYLOAD_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/normalized-discovery-payload.schema.json";
export declare const normalizedDiscoveryPayloadSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/normalized-discovery-payload.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["items", "provenanceMetadata", "sourceId"];
    readonly properties: {
        readonly items: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/discovery/normalized-discovery-item.schema.json";
            };
        };
        readonly provenanceMetadata: {
            readonly $ref: "https://market-design-engine.dev/schemas/discovery/discovery-provenance-metadata.schema.json";
        };
        readonly sourceId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
        };
    };
};
//# sourceMappingURL=normalized-discovery-payload.schema.d.ts.map