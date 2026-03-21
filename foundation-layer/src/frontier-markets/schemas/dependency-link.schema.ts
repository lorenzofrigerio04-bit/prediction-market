import { DependencyStrength } from "../enums/dependency-strength.enum.js";
import { DependencyType } from "../enums/dependency-type.enum.js";

export const DEPENDENCY_LINK_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/frontier-markets/dependency-link.schema.json";

export const dependencyLinkSchema = {
  $id: DEPENDENCY_LINK_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "source_ref",
    "target_ref",
    "dependency_type",
    "dependency_strength",
    "blocking",
  ],
  properties: {
    id: { type: "string", pattern: "^fdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    source_ref: {
      type: "object",
      additionalProperties: false,
      required: ["ref_type", "ref_id"],
      properties: {
        ref_type: { type: "string", enum: ["event", "market", "contract"] },
        ref_id: { type: "string", minLength: 1 },
      },
    },
    target_ref: {
      type: "object",
      additionalProperties: false,
      required: ["ref_type", "ref_id"],
      properties: {
        ref_type: { type: "string", enum: ["event", "market", "contract"] },
        ref_id: { type: "string", minLength: 1 },
      },
    },
    dependency_type: { type: "string", enum: Object.values(DependencyType) },
    dependency_strength: { type: "string", enum: Object.values(DependencyStrength) },
    blocking: { type: "boolean" },
  },
} as const;
