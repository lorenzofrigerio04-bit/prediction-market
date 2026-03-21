import { DiscoveryErrorCode } from "../enums/discovery-error-code.enum.js";
import { discoveryValidationFailureSchema } from "./discovery-validation-failure.schema.js";

export const DISCOVERY_ERROR_REPORT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/discovery/discovery-error-report.schema.json";

export const discoveryErrorReportSchema = {
  $id: DISCOVERY_ERROR_REPORT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["runId", "code", "message", "failures", "timestamp"],
  properties: {
    runId: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId",
    },
    code: { type: "string", enum: Object.values(DiscoveryErrorCode) },
    message: { type: "string" },
    failures: {
      type: "array",
      items: { $ref: discoveryValidationFailureSchema.$id },
    },
    timestamp: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
    },
  },
} as const;
