import { ValidatorSeverity } from "../../enums/validator-severity.enum.js";
export declare const OBSERVATION_NORMALIZATION_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/observations/observation-normalization-result.schema.json";
export declare const observationNormalizationResultSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/observations/observation-normalization-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["observation", "validationIssues", "normalizationIssues", "deterministicWarnings", "traceabilityCompleteness"];
    readonly properties: {
        readonly observation: {
            readonly $ref: "https://market-design-engine.dev/schemas/observations/source-observation.schema.json";
        };
        readonly validationIssues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "path", "message", "severity"];
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
                        readonly minLength: 1;
                    };
                    readonly severity: {
                        readonly type: "string";
                        readonly enum: ValidatorSeverity[];
                    };
                    readonly context: {
                        readonly type: "object";
                        readonly additionalProperties: true;
                    };
                };
            };
        };
        readonly normalizationIssues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "path", "message", "severity"];
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
                        readonly minLength: 1;
                    };
                    readonly severity: {
                        readonly type: "string";
                        readonly enum: ValidatorSeverity[];
                    };
                    readonly context: {
                        readonly type: "object";
                        readonly additionalProperties: true;
                    };
                };
            };
        };
        readonly deterministicWarnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly traceabilityCompleteness: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["hasSourceReference", "hasRawPayloadReference", "hasEvidenceSpans", "hasTraceabilityMetadata", "isComplete"];
            readonly properties: {
                readonly hasSourceReference: {
                    readonly type: "boolean";
                };
                readonly hasRawPayloadReference: {
                    readonly type: "boolean";
                };
                readonly hasEvidenceSpans: {
                    readonly type: "boolean";
                };
                readonly hasTraceabilityMetadata: {
                    readonly type: "boolean";
                };
                readonly isComplete: {
                    readonly type: "boolean";
                };
            };
        };
    };
};
//# sourceMappingURL=observation-normalization-result.schema.d.ts.map