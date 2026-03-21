import { PackageStatus } from "../enums/package-status.enum.js";
import { ArtifactType } from "../enums/artifact-type.enum.js";
import { MarketVisibility } from "../enums/market-visibility.enum.js";
import { ComplianceFlag } from "../enums/compliance-flag.enum.js";

export const PUBLICATION_PACKAGE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/live-integration/publication-package.schema.json";

export const publicationPackageSchema = {
  $id: PUBLICATION_PACKAGE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "publication_ready_artifact_id",
    "packaged_artifacts",
    "package_metadata",
    "package_status",
    "created_at",
  ],
  properties: {
    id: { type: "string", pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$" },
    publication_ready_artifact_id: { type: "string", pattern: "^prad_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    packaged_artifacts: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["artifact_type", "artifact_ref", "integrity_hash", "required"],
        properties: {
          artifact_type: { type: "string", enum: Object.values(ArtifactType) },
          artifact_ref: { type: "string", minLength: 1 },
          integrity_hash: { type: "string", pattern: "^([a-fA-F0-9]{64}|sha256:[a-fA-F0-9]{64})$" },
          required: { type: "boolean" },
        },
      },
    },
    package_metadata: {
      type: "object",
      additionalProperties: false,
      required: [
        "category",
        "tags",
        "jurisdiction",
        "display_priority",
        "market_visibility",
        "compliance_flags",
      ],
      properties: {
        category: { type: "string", minLength: 1 },
        tags: { type: "array", items: { type: "string", minLength: 1 } },
        jurisdiction: { type: "string", pattern: "^[A-Z]{2,3}$" },
        display_priority: { type: "integer", minimum: 0 },
        market_visibility: { type: "string", enum: Object.values(MarketVisibility) },
        compliance_flags: { type: "array", items: { type: "string", enum: Object.values(ComplianceFlag) } },
      },
    },
    package_status: { type: "string", enum: Object.values(PackageStatus) },
    created_at: { type: "string", format: "date-time" },
  },
} as const;
