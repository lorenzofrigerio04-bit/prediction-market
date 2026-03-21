import { describe, expect, it } from "vitest";
import { ajv } from "@/validators/ajv/ajv-instance.js";
import { SOURCE_RECORD_SCHEMA_ID } from "@/schemas/entities/source-record.schema.js";
import { EVENT_SIGNAL_SCHEMA_ID } from "@/schemas/entities/event-signal.schema.js";
import { CANONICAL_EVENT_SCHEMA_ID } from "@/schemas/entities/canonical-event.schema.js";
import { STRUCTURED_CLAIM_SCHEMA_ID } from "@/schemas/entities/structured-claim.schema.js";
import {
  createConfidenceScore,
  createEntityVersion,
  createEventId,
  createSourceId,
  createTag,
  createTimestamp,
  createTitle,
} from "@/index.js";
import { EventCategory } from "@/enums/event-category.enum.js";
import { EventPriority } from "@/enums/event-priority.enum.js";
import { EventStatus } from "@/enums/event-status.enum.js";

describe("schema alignment", () => {
  it("rejects invalid locale format in source record schema", () => {
    const validator = ajv.getSchema(SOURCE_RECORD_SCHEMA_ID)!;
    const payload = {
      id: createSourceId("src_abcdefg"),
      sourceType: "NEWS_ARTICLE",
      sourceName: "Reuters",
      sourceAuthorityScore: createConfidenceScore(0.8),
      title: createTitle("Headline"),
      description: "Summary",
      url: null,
      publishedAt: null,
      capturedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
      locale: "EN_us",
      tags: [createTag("news")],
      externalRef: null,
      entityVersion: createEntityVersion(),
    };
    expect(validator(payload)).toBe(false);
  });

  it("rejects malformed source id arrays in event signal schema", () => {
    const validator = ajv.getSchema(EVENT_SIGNAL_SCHEMA_ID)!;
    const payload = {
      id: createEventId("evt_abcdefg"),
      sourceRecordIds: ["bad_id"],
      rawHeadline: createTitle("Signal"),
      rawSummary: null,
      eventCategory: EventCategory.GENERAL,
      eventPriority: EventPriority.MEDIUM,
      occurredAt: null,
      detectedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
      jurisdictions: [],
      involvedEntities: [],
      tags: [createTag("news")],
      confidenceScore: createConfidenceScore(0.7),
      status: EventStatus.DETECTED,
      entityVersion: createEntityVersion(),
    };
    expect(validator(payload)).toBe(false);
  });

  it("rejects malformed support ids and tags in canonical event schema", () => {
    const validator = ajv.getSchema(CANONICAL_EVENT_SCHEMA_ID)!;
    const payload = {
      id: createEventId("evt_abcdefg"),
      title: createTitle("Event"),
      slug: "event",
      description: "desc",
      category: EventCategory.GENERAL,
      priority: EventPriority.MEDIUM,
      status: EventStatus.DETECTED,
      occurredAt: null,
      firstObservedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
      lastUpdatedAt: createTimestamp("2026-03-01T00:10:00.000Z"),
      jurisdictions: [],
      involvedEntities: [],
      supportingSourceRecordIds: ["src_abcdefg", "bad_source_id"],
      supportingSignalIds: ["evt_abcdefg", "bad_event_id"],
      tags: ["INVALID TAG"],
      confidenceScore: createConfidenceScore(0.7),
      resolutionWindow: null,
      entityVersion: createEntityVersion(),
    };
    expect(validator(payload)).toBe(false);
  });

  it("rejects malformed source ids in structured claim schema", () => {
    const validator = ajv.getSchema(STRUCTURED_CLAIM_SCHEMA_ID)!;
    const payload = {
      id: "clm_abcdefg",
      canonicalEventId: "evt_abcdefg",
      claimText: "text",
      normalizedClaimText: "text",
      polarity: "AFFIRMATIVE",
      claimSubject: "subject",
      claimPredicate: "predicate",
      claimObject: null,
      resolutionBasis: "OFFICIAL_SOURCE",
      resolutionWindow: {
        openAt: createTimestamp("2026-03-01T00:00:00.000Z"),
        closeAt: createTimestamp("2026-03-02T00:00:00.000Z"),
      },
      confidenceScore: createConfidenceScore(0.8),
      sourceRecordIds: ["src_abcdefg", "src_short"],
      tags: ["bad tag"],
      entityVersion: createEntityVersion(),
    };
    expect(validator(payload)).toBe(false);
  });
});
