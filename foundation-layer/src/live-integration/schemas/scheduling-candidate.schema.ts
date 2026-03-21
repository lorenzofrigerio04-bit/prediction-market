import { EventPriority } from "../../enums/event-priority.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { SchedulingStatus } from "../enums/scheduling-status.enum.js";

export const SCHEDULING_CANDIDATE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/live-integration/scheduling-candidate.schema.json";

export const schedulingCandidateSchema = {
  $id: SCHEDULING_CANDIDATE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "publication_package_id",
    "scheduling_window",
    "priority_level",
    "scheduling_notes",
    "scheduling_status",
    "readiness_status",
    "delivery_readiness_report_id",
    "blocking_issues_snapshot",
  ],
  properties: {
    id: { type: "string", pattern: "^scnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    publication_package_id: { type: "string", pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    scheduling_window: {
      type: "object",
      additionalProperties: false,
      required: ["start_at", "end_at"],
      properties: {
        start_at: { type: "string", format: "date-time" },
        end_at: { type: "string", format: "date-time" },
      },
    },
    priority_level: { type: "string", enum: Object.values(EventPriority) },
    scheduling_notes: { type: "array", items: { type: "string", minLength: 1 } },
    scheduling_status: { type: "string", enum: Object.values(SchedulingStatus) },
    readiness_status: { type: "string", enum: Object.values(ReadinessStatus) },
    delivery_readiness_report_id: {
      anyOf: [
        { type: "string", pattern: "^drrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        { type: "null" },
      ],
    },
    blocking_issues_snapshot: { type: "array", items: { type: "string", minLength: 1 } },
  },
} as const;
