import { ValidatorSeverity } from "../../enums/validator-severity.enum.js";

export const OBSERVATION_NORMALIZATION_RESULT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/observations/observation-normalization-result.schema.json";

export const observationNormalizationResultSchema = {
  $id: OBSERVATION_NORMALIZATION_RESULT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "observation",
    "validationIssues",
    "normalizationIssues",
    "deterministicWarnings",
    "traceabilityCompleteness",
  ],
  properties: {
    observation: {
      $ref: "https://market-design-engine.dev/schemas/observations/source-observation.schema.json",
    },
    validationIssues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["code", "path", "message", "severity"],
        properties: {
          code: { type: "string", minLength: 1 },
          path: { type: "string" },
          message: { type: "string", minLength: 1 },
          severity: { type: "string", enum: Object.values(ValidatorSeverity) },
          context: { type: "object", additionalProperties: true },
        },
      },
    },
    normalizationIssues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["code", "path", "message", "severity"],
        properties: {
          code: { type: "string", minLength: 1 },
          path: { type: "string" },
          message: { type: "string", minLength: 1 },
          severity: { type: "string", enum: Object.values(ValidatorSeverity) },
          context: { type: "object", additionalProperties: true },
        },
      },
    },
    deterministicWarnings: {
      type: "array",
      items: { type: "string", minLength: 1 },
    },
    traceabilityCompleteness: {
      type: "object",
      additionalProperties: false,
      required: [
        "hasSourceReference",
        "hasRawPayloadReference",
        "hasEvidenceSpans",
        "hasTraceabilityMetadata",
        "isComplete",
      ],
      properties: {
        hasSourceReference: { type: "boolean" },
        hasRawPayloadReference: { type: "boolean" },
        hasEvidenceSpans: { type: "boolean" },
        hasTraceabilityMetadata: { type: "boolean" },
        isComplete: { type: "boolean" },
      },
    },
  },
} as const;
