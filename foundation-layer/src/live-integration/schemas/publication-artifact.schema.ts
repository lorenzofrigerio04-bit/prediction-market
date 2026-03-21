import { ArtifactType } from "../enums/artifact-type.enum.js";

export const PUBLICATION_ARTIFACT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/live-integration/publication-artifact.schema.json";

export const publicationArtifactSchema = {
  $id: PUBLICATION_ARTIFACT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["artifact_type", "artifact_ref", "integrity_hash", "required"],
  properties: {
    artifact_type: { type: "string", enum: Object.values(ArtifactType) },
    artifact_ref: { type: "string", minLength: 1 },
    integrity_hash: {
      type: "string",
      pattern: "^([a-fA-F0-9]{64}|sha256:[a-fA-F0-9]{64})$",
    },
    required: { type: "boolean" },
  },
} as const;
