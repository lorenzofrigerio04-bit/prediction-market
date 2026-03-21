import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
export declare const DISCOVERY_PROVENANCE_METADATA_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-provenance-metadata.schema.json";
export declare const discoveryProvenanceMetadataSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-provenance-metadata.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["fetchedAt", "sourceDefinitionId", "runIdNullable", "sourceKey", "sourceRoleNullable", "sourceTier", "trustTier", "endpointReferenceNullable", "adapterKeyNullable", "fetchMetadataNullable"];
    readonly properties: {
        readonly fetchedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
        readonly sourceDefinitionId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
        };
        readonly runIdNullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId";
            }, {
                readonly type: "null";
            }];
        };
        readonly sourceKey: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9][a-z0-9_-]{2,62}$";
        };
        readonly sourceRoleNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: DiscoverySourceUsageRole[];
            }, {
                readonly type: "null";
            }];
        };
        readonly sourceTier: {
            readonly type: "string";
            readonly enum: DiscoverySourceTier[];
        };
        readonly trustTier: {
            readonly type: "string";
            readonly enum: DiscoveryTrustTier[];
        };
        readonly endpointReferenceNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly adapterKeyNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly fetchMetadataNullable: {
            readonly oneOf: readonly [{
                type: string;
                additionalProperties: boolean;
                properties: {
                    statusCodeNullable: {
                        oneOf: {
                            type: string;
                        }[];
                    };
                    etagNullable: {
                        oneOf: {
                            type: string;
                        }[];
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
    };
};
//# sourceMappingURL=discovery-provenance-metadata.schema.d.ts.map