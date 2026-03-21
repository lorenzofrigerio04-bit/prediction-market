import { DiscoveryRunTrigger } from "../enums/discovery-run-trigger.enum.js";
export declare const DISCOVERY_RUN_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-run-definition.schema.json";
export declare const discoveryRunDefinitionSchema: {
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
            readonly enum: DiscoveryRunTrigger[];
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
};
//# sourceMappingURL=discovery-run-definition.schema.d.ts.map