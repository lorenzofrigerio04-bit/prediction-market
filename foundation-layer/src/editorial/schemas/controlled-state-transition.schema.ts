export const CONTROLLED_STATE_TRANSITION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/editorial/controlled-state-transition.schema.json";

export const controlledStateTransitionSchema = {
  $id: CONTROLLED_STATE_TRANSITION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "publishable_candidate_id",
    "from_state",
    "to_state",
    "transition_at",
    "transitioned_by",
    "transition_reason",
    "audit_record_id",
  ],
  properties: {
    id: { type: "string", pattern: "^ctr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    publishable_candidate_id: { type: "string", pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    from_state: { type: "string", minLength: 1 },
    to_state: { type: "string", minLength: 1 },
    transition_at: { type: "string", format: "date-time" },
    transitioned_by: { type: "string", pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    transition_reason: { type: "string", minLength: 1 },
    audit_record_id: { type: "string", pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
  },
} as const;
