import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
export declare const NORMALIZED_DISCOVERY_ITEM_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/normalized-discovery-item.schema.json";
export declare const normalizedDiscoveryItemSchema: {
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
                readonly enum: DiscoveryGeoScope[];
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
                readonly enum: DiscoveryTopicScope[];
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
};
//# sourceMappingURL=normalized-discovery-item.schema.d.ts.map