import { describe, expect, it } from "vitest";
import { ajv } from "@/validators/ajv/ajv-instance.js";
import { EVENT_CANDIDATE_SCHEMA_ID } from "@/event-intelligence/schemas/event-candidate.schema.js";
import { EVENT_RELATION_SCHEMA_ID } from "@/event-intelligence/schemas/event-relation.schema.js";

describe("event intelligence schema alignment", () => {
  it("rejects invalid candidate enum value", () => {
    const validator = ajv.getSchema(EVENT_CANDIDATE_SCHEMA_ID)!;
    const payload = {
      id: "ecnd_abcdefg",
      version: 1,
      observation_ids: ["obs_abcdefg"],
      subject_candidate: {
        value: "Fed",
        normalized_value: "fed",
        entity_type: "ORG",
      },
      action_candidate: {
        value: "raises",
        normalized_value: "raise",
      },
      object_candidate_nullable: null,
      temporal_window_candidate: {
        start_at: "2026-03-01T00:00:00.000Z",
        end_at: "2026-03-02T00:00:00.000Z",
      },
      jurisdiction_candidate_nullable: null,
      category_candidate: "MACRO",
      extraction_confidence: 0.7,
      evidence_spans: [
        {
          span_id: "span-1",
          source_observation_id: "obs_abcdefg",
          locator: "/x",
          start_offset: 0,
          end_offset: 1,
          extracted_text_nullable: "Fed raises",
          mapped_field_nullable: "headline",
        },
      ],
      candidate_status: "BAD_STATUS",
    };
    expect(validator(payload)).toBe(false);
  });

  it("rejects malformed relation confidence", () => {
    const validator = ajv.getSchema(EVENT_RELATION_SCHEMA_ID)!;
    const payload = {
      id: "erel_abcdefg",
      source_event_id: "cevt_abcdefg",
      target_event_id: "cevt_abcdefh",
      relation_type: "dependency",
      relation_confidence: 1.5,
    };
    expect(validator(payload)).toBe(false);
  });
});
