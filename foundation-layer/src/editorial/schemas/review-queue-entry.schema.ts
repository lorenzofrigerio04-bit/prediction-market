import { PriorityLevel } from "../enums/priority-level.enum.js";
import { QueueStatus } from "../enums/queue-status.enum.js";
import { ReasonCode } from "../enums/reason-code.enum.js";

export const REVIEW_QUEUE_ENTRY_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/editorial/review-queue-entry.schema.json";

export const reviewQueueEntrySchema = {
  $id: REVIEW_QUEUE_ENTRY_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "publishable_candidate_id",
    "queue_status",
    "priority_level",
    "entered_queue_at",
    "assigned_reviewer_nullable",
    "queue_reason",
    "blocking_flags",
    "warnings",
  ],
  properties: {
    id: { type: "string", pattern: "^rqe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    publishable_candidate_id: { type: "string", pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    queue_status: { type: "string", enum: Object.values(QueueStatus) },
    priority_level: { type: "string", enum: Object.values(PriorityLevel) },
    entered_queue_at: { type: "string", format: "date-time" },
    assigned_reviewer_nullable: {
      anyOf: [{ type: "null" }, { type: "string", pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }],
    },
    queue_reason: { type: "string", enum: Object.values(ReasonCode) },
    blocking_flags: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["code", "message", "path", "is_resolved"],
        properties: {
          code: { type: "string", enum: Object.values(ReasonCode) },
          message: { type: "string", minLength: 1 },
          path: { type: "string", minLength: 1 },
          is_resolved: { type: "boolean" },
        },
      },
    },
    warnings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["code", "message", "path"],
        properties: {
          code: { type: "string", enum: Object.values(ReasonCode) },
          message: { type: "string", minLength: 1 },
          path: { type: "string", minLength: 1 },
        },
      },
    },
  },
} as const;
