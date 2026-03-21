import { EvidenceSpanKind } from "../enums/evidence-span-kind.enum.js";
import { NormalizationStatus } from "../enums/normalization-status.enum.js";
import { SourceReferenceKind } from "../enums/source-reference-kind.enum.js";
export const SOURCE_OBSERVATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/observations/source-observation.schema.json";
export const sourceObservationSchema = {
    $id: SOURCE_OBSERVATION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "sourceDefinitionId",
        "observedAt",
        "ingestedAt",
        "sourceReference",
        "rawPayloadReference",
        "normalizedHeadlineNullable",
        "normalizedSummaryNullable",
        "extractedEntities",
        "extractedDates",
        "extractedNumbers",
        "extractedClaims",
        "language",
        "jurisdictionCandidates",
        "evidenceSpans",
        "sourceConfidence",
        "normalizationStatus",
        "traceabilityMetadata",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId",
        },
        version: { type: "integer", minimum: 1 },
        sourceDefinitionId: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId",
        },
        observedAt: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
        ingestedAt: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
        sourceReference: {
            type: "object",
            additionalProperties: false,
            required: ["kind", "reference", "locator"],
            properties: {
                kind: { type: "string", enum: Object.values(SourceReferenceKind) },
                reference: { type: "string", minLength: 1 },
                locator: { type: ["string", "null"] },
            },
        },
        rawPayloadReference: {
            type: "object",
            additionalProperties: false,
            required: ["uri", "checksum"],
            properties: {
                uri: { type: "string", minLength: 1 },
                checksum: { type: ["string", "null"] },
            },
        },
        normalizedHeadlineNullable: { type: ["string", "null"] },
        normalizedSummaryNullable: { type: ["string", "null"] },
        extractedEntities: { type: "array", items: { type: "string" } },
        extractedDates: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
            },
        },
        extractedNumbers: { type: "array", items: { type: "number" } },
        extractedClaims: { type: "array", items: { type: "string" } },
        language: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/languageCode",
        },
        jurisdictionCandidates: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["code", "confidence"],
                properties: {
                    code: { type: "string", pattern: "^[A-Z]{2,8}$" },
                    confidence: {
                        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
                    },
                },
            },
        },
        evidenceSpans: {
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                additionalProperties: false,
                required: [
                    "spanId",
                    "kind",
                    "locator",
                    "startOffset",
                    "endOffset",
                    "extractedText",
                    "mappedField",
                ],
                properties: {
                    spanId: { type: "string", minLength: 1 },
                    kind: { type: "string", enum: Object.values(EvidenceSpanKind) },
                    locator: { type: "string", minLength: 1 },
                    startOffset: { type: ["integer", "null"], minimum: 0 },
                    endOffset: { type: ["integer", "null"], minimum: 0 },
                    extractedText: { type: ["string", "null"] },
                    mappedField: { type: ["string", "null"] },
                },
            },
        },
        sourceConfidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
        normalizationStatus: {
            type: "string",
            enum: Object.values(NormalizationStatus),
        },
        traceabilityMetadata: {
            type: "object",
            additionalProperties: false,
            required: [
                "normalizerVersion",
                "mappingStrategyIds",
                "isTraceabilityComplete",
                "provenanceChain",
            ],
            properties: {
                normalizerVersion: { type: "string", minLength: 1 },
                mappingStrategyIds: {
                    type: "array",
                    minItems: 1,
                    items: { type: "string", minLength: 1 },
                },
                isTraceabilityComplete: { type: "boolean" },
                provenanceChain: { type: "array", items: { type: "string" } },
            },
        },
    },
};
//# sourceMappingURL=source-observation.schema.js.map