import { AuthenticationMode } from "../enums/authentication-mode.enum.js";
import { SourceHealthStatus } from "../enums/source-health-status.enum.js";
export declare const SOURCE_REGISTRY_ENTRY_SCHEMA_ID = "https://market-design-engine.dev/schemas/sources/source-registry-entry.schema.json";
export declare const sourceRegistryEntrySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/sources/source-registry-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["sourceDefinitionId", "pollingPolicyNullable", "rateLimitProfileNullable", "authenticationMode", "healthStatus", "ownerNotesNullable", "auditMetadata"];
    readonly properties: {
        readonly sourceDefinitionId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
        };
        readonly pollingPolicyNullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["intervalSeconds", "jitterSeconds"];
                readonly properties: {
                    readonly intervalSeconds: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                    readonly jitterSeconds: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly rateLimitProfileNullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["maxRequests", "perSeconds"];
                readonly properties: {
                    readonly maxRequests: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                    readonly perSeconds: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly authenticationMode: {
            readonly type: "string";
            readonly enum: AuthenticationMode[];
        };
        readonly healthStatus: {
            readonly type: "string";
            readonly enum: SourceHealthStatus[];
        };
        readonly ownerNotesNullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly auditMetadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["createdBy", "createdAt", "updatedBy", "updatedAt"];
            readonly properties: {
                readonly createdBy: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly createdAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                };
                readonly updatedBy: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly updatedAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                };
            };
        };
    };
};
//# sourceMappingURL=source-registry-entry.schema.d.ts.map