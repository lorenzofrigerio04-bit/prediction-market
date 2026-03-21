import { ConflictRiskLevel } from "../enums/conflict-risk-level.enum.js";
import { ResolutionEligibility } from "../enums/resolution-eligibility.enum.js";

export const RELIABILITY_PROFILE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/sources/reliability-profile.schema.json";

export const reliabilityProfileSchema = {
  $id: RELIABILITY_PROFILE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "authorityScore",
    "historicalStabilityScore",
    "resolutionEligibility",
    "conflictRiskLevel",
  ],
  properties: {
    authorityScore: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
    },
    historicalStabilityScore: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
    },
    resolutionEligibility: {
      type: "string",
      enum: Object.values(ResolutionEligibility),
    },
    conflictRiskLevel: {
      type: "string",
      enum: Object.values(ConflictRiskLevel),
    },
  },
} as const;
