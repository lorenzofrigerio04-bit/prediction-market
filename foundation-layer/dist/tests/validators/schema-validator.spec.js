import { describe, expect, it } from "vitest";
import { createEventSignal } from "@/entities/event-signal.entity.js";
import { EventCategory } from "@/enums/event-category.enum.js";
import { EventPriority } from "@/enums/event-priority.enum.js";
import { validateEventSignal } from "@/validators/event-signal.validator.js";
import { createConfidenceScore, createEntityVersion, createEventId, createSourceId, createTag, createTimestamp, createTitle, } from "@/index.js";
describe("schema validation determinism", () => {
    it("accepts valid event signal payload", () => {
        const signal = createEventSignal({
            id: createEventId("evt_abcdefg"),
            sourceRecordIds: [createSourceId("src_abcdefg")],
            rawHeadline: createTitle("Valid signal"),
            rawSummary: null,
            eventCategory: EventCategory.GENERAL,
            eventPriority: EventPriority.MEDIUM,
            occurredAt: null,
            detectedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
            jurisdictions: ["US"],
            involvedEntities: ["Entity"],
            tags: [createTag("tag")],
            confidenceScore: createConfidenceScore(0.5),
            entityVersion: createEntityVersion(),
        });
        expect(validateEventSignal(signal).isValid).toBe(true);
    });
    it("returns INVALID_ENUM for malformed enum value", () => {
        const payload = {
            id: "evt_abcdefg",
            sourceRecordIds: ["src_abcdefg"],
            rawHeadline: "Bad enum",
            rawSummary: null,
            eventCategory: "INVALID_ENUM_VALUE",
            eventPriority: EventPriority.MEDIUM,
            occurredAt: null,
            detectedAt: "2026-03-01T00:00:00.000Z",
            jurisdictions: [],
            involvedEntities: [],
            tags: [],
            confidenceScore: 0.5,
            status: "DETECTED",
            entityVersion: 1,
        };
        const report = validateEventSignal(payload);
        expect(report.isValid).toBe(false);
        expect(report.issues.some((issue) => issue.code === "INVALID_ENUM")).toBe(true);
    });
});
//# sourceMappingURL=schema-validator.spec.js.map