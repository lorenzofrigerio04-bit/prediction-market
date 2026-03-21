import { DiscoverySourceAuthMode } from "../enums/discovery-auth-mode.enum.js";
import { DiscoverySourceCapability } from "../enums/discovery-source-capability.enum.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryPollingHint } from "../enums/discovery-polling-hint.enum.js";
import { DiscoverySourceStatus } from "../enums/discovery-source-status.enum.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
export declare const DISCOVERY_SOURCE_CATALOG_ENTRY_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-source-catalog-entry.schema.json";
export declare const discoverySourceCatalogEntrySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-source-catalog-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "key", "name", "kind", "tier", "status", "role", "pollingHint", "geoScope", "topicScope", "trustTier", "endpoint", "authMode", "sourceDefinitionIdNullable", "scheduleHint", "descriptionNullable", "capabilities"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
        };
        readonly key: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9][a-z0-9_-]{2,62}$";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly kind: {
            readonly type: "string";
            readonly enum: DiscoverySourceKind[];
        };
        readonly tier: {
            readonly type: "string";
            readonly enum: DiscoverySourceTier[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: DiscoverySourceStatus[];
        };
        readonly role: {
            readonly type: "string";
            readonly enum: DiscoverySourceUsageRole[];
        };
        readonly pollingHint: {
            readonly type: "string";
            readonly enum: DiscoveryPollingHint[];
        };
        readonly geoScope: {
            readonly type: "string";
            readonly enum: DiscoveryGeoScope[];
        };
        readonly topicScope: {
            readonly type: "string";
            readonly enum: DiscoveryTopicScope[];
        };
        readonly trustTier: {
            readonly type: "string";
            readonly enum: DiscoveryTrustTier[];
        };
        readonly endpoint: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                url: {
                    type: string;
                    minLength: number;
                };
                method: {
                    type: string;
                    minLength: number;
                };
                headersNullable: {
                    oneOf: ({
                        type: string;
                        additionalProperties: {
                            type: string;
                        };
                    } | {
                        type: string;
                        additionalProperties?: never;
                    })[];
                };
            };
        };
        readonly authMode: {
            readonly type: "string";
            readonly enum: DiscoverySourceAuthMode[];
        };
        readonly sourceDefinitionIdNullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
            }, {
                readonly type: "null";
            }];
        };
        readonly scheduleHint: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                cronExpressionNullable: {
                    oneOf: {
                        type: string;
                    }[];
                };
                intervalSecondsNullable: {
                    oneOf: ({
                        type: string;
                        minimum: number;
                    } | {
                        type: string;
                        minimum?: never;
                    })[];
                };
            };
        };
        readonly descriptionNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly capabilities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: DiscoverySourceCapability[];
            };
            readonly minItems: 0;
        };
    };
};
//# sourceMappingURL=discovery-source-catalog-entry.schema.d.ts.map