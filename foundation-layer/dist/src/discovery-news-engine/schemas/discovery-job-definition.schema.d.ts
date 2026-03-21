export declare const DISCOVERY_JOB_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-job-definition.schema.json";
export declare const discoveryJobDefinitionSchema: {
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
};
//# sourceMappingURL=discovery-job-definition.schema.d.ts.map