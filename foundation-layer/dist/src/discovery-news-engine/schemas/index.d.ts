export declare const discoveryNewsEngineSchemas: readonly [{
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
                readonly enum: import("../index.js").DiscoverySourceUsageRole[];
            }, {
                readonly type: "null";
            }];
        };
        readonly sourceTier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceTier[];
        };
        readonly trustTier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTrustTier[];
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/normalized-discovery-item.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["headline", "bodySnippetNullable", "canonicalUrl", "externalItemId", "publishedAt", "publishedAtPresent", "sourceReference", "geoSignalNullable", "geoPlaceTextNullable", "topicSignalNullable", "languageCode", "observedMetricsNullable"];
    readonly properties: {
        readonly headline: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly bodySnippetNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly canonicalUrl: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly externalItemId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly publishedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
        readonly publishedAtPresent: {
            readonly type: "boolean";
        };
        readonly sourceReference: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                sourceId: {
                    $ref: string;
                };
                locator: {
                    type: string;
                    minLength: number;
                };
                labelNullable: {
                    oneOf: {
                        type: string;
                    }[];
                };
                sourceKeyNullable: {
                    oneOf: ({
                        type: string;
                        pattern: string;
                    } | {
                        type: string;
                        pattern?: never;
                    })[];
                };
            };
        };
        readonly geoSignalNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: import("../index.js").DiscoveryGeoScope[];
            }, {
                readonly type: "null";
            }];
        };
        readonly geoPlaceTextNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly topicSignalNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: import("../index.js").DiscoveryTopicScope[];
            }, {
                readonly type: "null";
            }];
        };
        readonly languageCode: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/languageCode";
        };
        readonly observedMetricsNullable: {
            readonly oneOf: readonly [{
                type: string;
                additionalProperties: boolean;
                properties: {
                    pageviewsNullable: {
                        type: string;
                    };
                    timeframeNullable: {
                        type: string;
                    };
                    regionNullable: {
                        type: string;
                    };
                    channelIdNullable: {
                        type: string;
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-source-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "key", "kind", "tier", "status", "pollingHint", "geoScope", "topicScope", "trustTier", "endpoint", "authMode", "sourceDefinitionIdNullable"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
        };
        readonly key: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9][a-z0-9_-]{2,62}$";
        };
        readonly kind: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceKind[];
        };
        readonly tier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceTier[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceStatus[];
        };
        readonly pollingHint: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryPollingHint[];
        };
        readonly geoScope: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryGeoScope[];
        };
        readonly topicScope: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTopicScope[];
        };
        readonly trustTier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTrustTier[];
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
            readonly enum: import("../index.js").DiscoverySourceAuthMode[];
        };
        readonly sourceDefinitionIdNullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
            }, {
                readonly type: "null";
            }];
        };
        readonly roleNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: import("../index.js").DiscoverySourceUsageRole[];
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
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
            readonly enum: import("../index.js").DiscoverySourceKind[];
        };
        readonly tier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceTier[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceStatus[];
        };
        readonly role: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceUsageRole[];
        };
        readonly pollingHint: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryPollingHint[];
        };
        readonly geoScope: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryGeoScope[];
        };
        readonly topicScope: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTopicScope[];
        };
        readonly trustTier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTrustTier[];
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
            readonly enum: import("../index.js").DiscoverySourceAuthMode[];
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
                readonly enum: import("../index.js").DiscoverySourceCapability[];
            };
            readonly minItems: 0;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-validation-failure.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["code", "path", "message", "contextNullable"];
    readonly properties: {
        readonly code: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly path: {
            readonly type: "string";
        };
        readonly message: {
            readonly type: "string";
        };
        readonly contextNullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-error-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["runId", "code", "message", "failures", "timestamp"];
    readonly properties: {
        readonly runId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId";
        };
        readonly code: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryErrorCode[];
        };
        readonly message: {
            readonly type: "string";
        };
        readonly failures: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/discovery/discovery-validation-failure.schema.json";
            };
        };
        readonly timestamp: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-run-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["runId", "sourceIds", "trigger", "scheduleHintNullable", "executionWindowNullable"];
    readonly properties: {
        readonly runId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId";
        };
        readonly sourceIds: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
            };
        };
        readonly trigger: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryRunTrigger[];
        };
        readonly scheduleHintNullable: {
            readonly oneOf: readonly [{
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
                        oneOf: {
                            type: string;
                        }[];
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly executionWindowNullable: {
            readonly oneOf: readonly [{
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    start: {
                        $ref: string;
                    };
                    end: {
                        $ref: string;
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-job-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["jobId", "runDefinition", "scheduleHint", "maxDurationSecondsNullable"];
    readonly properties: {
        readonly jobId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryJobId";
        };
        readonly runDefinition: {
            readonly $ref: "https://market-design-engine.dev/schemas/discovery/discovery-run-definition.schema.json";
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
                    oneOf: {
                        type: string;
                    }[];
                };
            };
        };
        readonly maxDurationSecondsNullable: {
            readonly oneOf: readonly [{
                readonly type: "number";
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "kind", "payloadRef", "timeWindow", "freshnessClass", "priorityHint", "status", "evidenceRefs", "provenanceMetadata", "createdAt"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySignalId";
        };
        readonly kind: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySignalKind[];
        };
        readonly payloadRef: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                normalizedItemId: {
                    type: string;
                    minLength: number;
                };
            };
        };
        readonly timeWindow: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                start: {
                    $ref: string;
                };
                end: {
                    $ref: string;
                };
            };
        };
        readonly freshnessClass: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySignalFreshnessClass[];
        };
        readonly priorityHint: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySignalPriorityHint[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySignalStatus[];
        };
        readonly evidenceRefs: {
            readonly type: "array";
            readonly items: {
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    itemId: {
                        type: string;
                        minLength: number;
                    };
                    role: {
                        type: string;
                        enum: import("../index.js").DiscoveryEvidenceRole[];
                    };
                };
            };
        };
        readonly provenanceMetadata: {
            readonly $ref: "https://market-design-engine.dev/schemas/discovery/discovery-provenance-metadata.schema.json";
        };
        readonly createdAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
    };
}];
export { DISCOVERY_ERROR_REPORT_SCHEMA_ID } from "./discovery-error-report.schema.js";
export { DISCOVERY_JOB_DEFINITION_SCHEMA_ID } from "./discovery-job-definition.schema.js";
export { DISCOVERY_PROVENANCE_METADATA_SCHEMA_ID } from "./discovery-provenance-metadata.schema.js";
export { DISCOVERY_RUN_DEFINITION_SCHEMA_ID } from "./discovery-run-definition.schema.js";
export { DISCOVERY_SIGNAL_SCHEMA_ID } from "./discovery-signal.schema.js";
export { DISCOVERY_SOURCE_CATALOG_ENTRY_SCHEMA_ID } from "./discovery-source-catalog-entry.schema.js";
export { DISCOVERY_SOURCE_DEFINITION_SCHEMA_ID } from "./discovery-source-definition.schema.js";
export { DISCOVERY_VALIDATION_FAILURE_SCHEMA_ID } from "./discovery-validation-failure.schema.js";
export { NORMALIZED_DISCOVERY_ITEM_SCHEMA_ID } from "./normalized-discovery-item.schema.js";
export { NORMALIZED_DISCOVERY_PAYLOAD_SCHEMA_ID } from "./normalized-discovery-payload.schema.js";
//# sourceMappingURL=index.d.ts.map