import { HandoffStatus } from "../enums/handoff-status.enum.js";

export const PUBLICATION_HANDOFF_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/live-integration/publication-handoff.schema.json";

export const publicationHandoffSchema = {
  $id: PUBLICATION_HANDOFF_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "publication_package_id",
    "handoff_status",
    "initiated_by",
    "initiated_at",
    "delivery_notes",
    "audit_ref",
  ],
  properties: {
    id: { type: "string", pattern: "^phnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$" },
    publication_package_id: { type: "string", pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    handoff_status: { type: "string", enum: Object.values(HandoffStatus) },
    initiated_by: { type: "string", minLength: 1 },
    initiated_at: { type: "string", format: "date-time" },
    delivery_notes: { type: "array", items: { type: "string", minLength: 1 } },
    audit_ref: { type: "string", pattern: "^aref_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
  },
} as const;
