import { AuthenticationMode } from "../enums/authentication-mode.enum.js";
import { SourceHealthStatus } from "../enums/source-health-status.enum.js";

export const SOURCE_REGISTRY_ENTRY_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/sources/source-registry-entry.schema.json";

export const sourceRegistryEntrySchema = {
  $id: SOURCE_REGISTRY_ENTRY_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "sourceDefinitionId",
    "pollingPolicyNullable",
    "rateLimitProfileNullable",
    "authenticationMode",
    "healthStatus",
    "ownerNotesNullable",
    "auditMetadata",
  ],
  properties: {
    sourceDefinitionId: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId",
    },
    pollingPolicyNullable: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["intervalSeconds", "jitterSeconds"],
          properties: {
            intervalSeconds: { type: "integer", minimum: 1 },
            jitterSeconds: { type: "integer", minimum: 0 },
          },
        },
        { type: "null" },
      ],
    },
    rateLimitProfileNullable: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["maxRequests", "perSeconds"],
          properties: {
            maxRequests: { type: "integer", minimum: 1 },
            perSeconds: { type: "integer", minimum: 1 },
          },
        },
        { type: "null" },
      ],
    },
    authenticationMode: {
      type: "string",
      enum: Object.values(AuthenticationMode),
    },
    healthStatus: { type: "string", enum: Object.values(SourceHealthStatus) },
    ownerNotesNullable: { type: ["string", "null"] },
    auditMetadata: {
      type: "object",
      additionalProperties: false,
      required: ["createdBy", "createdAt", "updatedBy", "updatedAt"],
      properties: {
        createdBy: { type: "string", minLength: 1 },
        createdAt: {
          $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
        updatedBy: { type: "string", minLength: 1 },
        updatedAt: {
          $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
      },
    },
  },
} as const;
