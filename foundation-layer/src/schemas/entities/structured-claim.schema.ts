import { ClaimPolarity } from "../../enums/claim-polarity.enum.js";
import { MarketResolutionBasis } from "../../enums/market-resolution-basis.enum.js";

export const STRUCTURED_CLAIM_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/entities/structured-claim.schema.json";

export const structuredClaimSchema = {
  $id: STRUCTURED_CLAIM_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "canonicalEventId",
    "claimText",
    "normalizedClaimText",
    "polarity",
    "claimSubject",
    "claimPredicate",
    "claimObject",
    "resolutionBasis",
    "resolutionWindow",
    "confidenceScore",
    "sourceRecordIds",
    "tags",
    "entityVersion",
  ],
  properties: {
    id: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/claimId",
    },
    canonicalEventId: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId",
    },
    claimText: { type: "string", minLength: 1 },
    normalizedClaimText: { type: "string", minLength: 1 },
    polarity: { type: "string", enum: Object.values(ClaimPolarity) },
    claimSubject: { type: "string", minLength: 1 },
    claimPredicate: { type: "string", minLength: 1 },
    claimObject: { type: ["string", "null"] },
    resolutionBasis: { type: "string", enum: Object.values(MarketResolutionBasis) },
    resolutionWindow: {
      type: "object",
      additionalProperties: false,
      required: ["openAt", "closeAt"],
      properties: {
        openAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
        closeAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
      },
    },
    confidenceScore: { $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json" },
    sourceRecordIds: {
      type: "array",
      minItems: 1,
      items: {
        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId",
      },
    },
    tags: {
      type: "array",
      items: {
        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag",
      },
    },
    entityVersion: { type: "integer", minimum: 1 },
  },
} as const;
