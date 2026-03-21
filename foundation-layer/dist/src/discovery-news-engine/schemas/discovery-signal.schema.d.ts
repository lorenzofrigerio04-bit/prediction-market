import { DiscoverySignalFreshnessClass } from "../enums/discovery-signal-freshness-class.enum.js";
import { DiscoverySignalKind } from "../enums/discovery-signal-kind.enum.js";
import { DiscoverySignalPriorityHint } from "../enums/discovery-signal-priority-hint.enum.js";
import { DiscoverySignalStatus } from "../enums/discovery-signal-status.enum.js";
import { DiscoveryEvidenceRole } from "../enums/discovery-evidence-role.enum.js";
export declare const DISCOVERY_SIGNAL_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-signal.schema.json";
export declare const discoverySignalSchema: {
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
            readonly enum: DiscoverySignalKind[];
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
            readonly enum: DiscoverySignalFreshnessClass[];
        };
        readonly priorityHint: {
            readonly type: "string";
            readonly enum: DiscoverySignalPriorityHint[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: DiscoverySignalStatus[];
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
                        enum: DiscoveryEvidenceRole[];
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
};
//# sourceMappingURL=discovery-signal.schema.d.ts.map