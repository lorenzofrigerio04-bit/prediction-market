import { describe, expect, it } from "vitest";
import { createCanonicalEvent } from "@/entities/canonical-event.entity.js";
import { createCandidateMarket } from "@/entities/candidate-market.entity.js";
import { createMarketOutcome } from "@/entities/market-outcome.entity.js";
import { createStructuredClaim } from "@/entities/structured-claim.entity.js";
import { EventCategory } from "@/enums/event-category.enum.js";
import { EventPriority } from "@/enums/event-priority.enum.js";
import { EventStatus } from "@/enums/event-status.enum.js";
import { CandidateOutcomeType } from "@/enums/candidate-outcome-type.enum.js";
import { ClaimPolarity } from "@/enums/claim-polarity.enum.js";
import { MarketResolutionBasis } from "@/enums/market-resolution-basis.enum.js";
import { MarketType } from "@/enums/market-type.enum.js";
import { createCandidateMarketId, createClaimId, createConfidenceScore, createDescription, createEntityVersion, createEventId, createOutcomeId, createTimestamp, createResolutionWindow, createSlug, createSourceId, createTag, createTitle, } from "@/index.js";
describe("entities", () => {
    it("rejects canonical event where firstObservedAt is after lastUpdatedAt", () => {
        expect(() => createCanonicalEvent({
            id: createEventId("evt_abcdefg"),
            title: createTitle("Election announced"),
            slug: createSlug("Election announced"),
            description: createDescription("Election date has been announced."),
            category: EventCategory.POLITICS,
            priority: EventPriority.HIGH,
            status: EventStatus.DETECTED,
            occurredAt: null,
            firstObservedAt: createTimestamp("2026-03-02T00:00:00.000Z"),
            lastUpdatedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
            jurisdictions: ["US"],
            involvedEntities: ["SEC"],
            supportingSourceRecordIds: [createSourceId("src_abcdefg")],
            supportingSignalIds: [createEventId("evt_abcdefh")],
            tags: [createTag("politics")],
            confidenceScore: createConfidenceScore(0.8),
            resolutionWindow: null,
            entityVersion: createEntityVersion(),
        })).toThrow();
    });
    it("rejects candidate market with duplicate normalized outcome labels", () => {
        const yes = createMarketOutcome({
            id: createOutcomeId("out_abcdefg"),
            outcomeType: CandidateOutcomeType.YES,
            label: "Yes",
            shortLabel: null,
            description: null,
            orderIndex: 0,
            probabilityHint: null,
            entityVersion: createEntityVersion(),
        });
        const yesDuplicate = createMarketOutcome({
            id: createOutcomeId("out_abcdefh"),
            outcomeType: CandidateOutcomeType.NO,
            label: "  YES  ",
            shortLabel: null,
            description: null,
            orderIndex: 1,
            probabilityHint: null,
            entityVersion: createEntityVersion(),
        });
        expect(() => createCandidateMarket({
            id: createCandidateMarketId("mkt_abcdefg"),
            claimId: createClaimId("clm_abcdefg"),
            canonicalEventId: createEventId("evt_abcdefg"),
            title: createTitle("Will X happen?"),
            slug: createSlug("Will X happen?"),
            description: createDescription("Candidate market"),
            resolutionBasis: MarketResolutionBasis.OFFICIAL_SOURCE,
            resolutionWindow: createResolutionWindow("2026-04-01T00:00:00.000Z", "2026-06-01T00:00:00.000Z"),
            outcomes: [yes, yesDuplicate],
            marketType: MarketType.BINARY,
            categories: ["politics"],
            tags: [createTag("market")],
            confidenceScore: createConfidenceScore(0.8),
            draftNotes: null,
            entityVersion: createEntityVersion(),
        })).toThrow();
    });
    it("requires at least one source record id for structured claim", () => {
        expect(() => createStructuredClaim({
            id: createClaimId("clm_abcdefh"),
            canonicalEventId: createEventId("evt_abcdefh"),
            claimText: "The bill will pass by June.",
            normalizedClaimText: "the bill will pass by june",
            polarity: ClaimPolarity.AFFIRMATIVE,
            claimSubject: "bill",
            claimPredicate: "pass by June",
            claimObject: null,
            resolutionBasis: MarketResolutionBasis.OFFICIAL_SOURCE,
            resolutionWindow: createResolutionWindow("2026-01-01T00:00:00.000Z", "2026-06-30T00:00:00.000Z"),
            confidenceScore: createConfidenceScore(0.7),
            sourceRecordIds: [],
            tags: [createTag("law")],
            entityVersion: createEntityVersion(),
        })).toThrow();
    });
});
//# sourceMappingURL=entities.spec.js.map