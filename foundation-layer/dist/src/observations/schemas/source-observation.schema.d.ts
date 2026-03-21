import { EvidenceSpanKind } from "../enums/evidence-span-kind.enum.js";
import { NormalizationStatus } from "../enums/normalization-status.enum.js";
import { SourceReferenceKind } from "../enums/source-reference-kind.enum.js";
export declare const SOURCE_OBSERVATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/observations/source-observation.schema.json";
export declare const sourceObservationSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/observations/source-observation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "sourceDefinitionId", "observedAt", "ingestedAt", "sourceReference", "rawPayloadReference", "normalizedHeadlineNullable", "normalizedSummaryNullable", "extractedEntities", "extractedDates", "extractedNumbers", "extractedClaims", "language", "jurisdictionCandidates", "evidenceSpans", "sourceConfidence", "normalizationStatus", "traceabilityMetadata"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly sourceDefinitionId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
        };
        readonly observedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
        readonly ingestedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
        readonly sourceReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "reference", "locator"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                    readonly enum: SourceReferenceKind[];
                };
                readonly reference: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly locator: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly rawPayloadReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["uri", "checksum"];
            readonly properties: {
                readonly uri: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly checksum: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly normalizedHeadlineNullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly normalizedSummaryNullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly extractedEntities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly extractedDates: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
            };
        };
        readonly extractedNumbers: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
        };
        readonly extractedClaims: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly language: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/languageCode";
        };
        readonly jurisdictionCandidates: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "confidence"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly pattern: "^[A-Z]{2,8}$";
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                };
            };
        };
        readonly evidenceSpans: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["spanId", "kind", "locator", "startOffset", "endOffset", "extractedText", "mappedField"];
                readonly properties: {
                    readonly spanId: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly kind: {
                        readonly type: "string";
                        readonly enum: EvidenceSpanKind[];
                    };
                    readonly locator: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly startOffset: {
                        readonly type: readonly ["integer", "null"];
                        readonly minimum: 0;
                    };
                    readonly endOffset: {
                        readonly type: readonly ["integer", "null"];
                        readonly minimum: 0;
                    };
                    readonly extractedText: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly mappedField: {
                        readonly type: readonly ["string", "null"];
                    };
                };
            };
        };
        readonly sourceConfidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly normalizationStatus: {
            readonly type: "string";
            readonly enum: NormalizationStatus[];
        };
        readonly traceabilityMetadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["normalizerVersion", "mappingStrategyIds", "isTraceabilityComplete", "provenanceChain"];
            readonly properties: {
                readonly normalizerVersion: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly mappingStrategyIds: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly isTraceabilityComplete: {
                    readonly type: "boolean";
                };
                readonly provenanceChain: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=source-observation.schema.d.ts.map