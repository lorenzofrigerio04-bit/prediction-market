import { describe, expect, it } from "vitest";
import { toCandidateDraftContract } from "../candidate-submission-adapter";
import { manualDraftToCandidate } from "../manual-submission-to-candidate-adapter";
import { toPublishableCandidateContract } from "../publication-action-adapter";
import { toGovernanceAuditEvent } from "../governance-audit-adapter";
import { toCreditsReadModel } from "../credits-read-model-adapter";

describe("legacy integration adapters hardening", () => {
  it("normalizes legacy candidate submissions without breaking optional compat fields", () => {
    const closesAt = new Date("2026-06-01T12:00:00.000Z");
    const result = toCandidateDraftContract({
      title: "  Juventus vincerà il campionato?  ",
      description: "  Derby d'Italia decisivo.  ",
      category: "  Sport  ",
      closesAt,
      resolutionSource: "  https://example.com/source  ",
      notifyPhone: "   ",
    });

    expect(result).toEqual({
      title: "Juventus vincerà il campionato?",
      description: "Derby d'Italia decisivo.",
      category: "Sport",
      closesAt,
      resolutionSourceUrl: "https://example.com/source",
      metadata: {
        source: "community_submit",
        notifyPhone: null,
      },
    });
  });

  it("normalizes publishable candidates while preserving passthrough fields", () => {
    const result = toPublishableCandidateContract({
      title: "  Bitcoin supererà 150.000 USD?  ",
      description: "  Domanda macro.  ",
      category: "  Economia  ",
      closesAt: "2026-09-01T10:00:00.000Z",
      resolutionAuthorityHost: "  coingecko.com  ",
      resolutionSourceUrl: "  https://www.coingecko.com/en/coins/bitcoin  ",
      resolutionCriteriaYes: "  BTC >= 150k  ",
      resolutionCriteriaNo: "   ",
      score: 91,
      sourceStorylineId: "story-1",
    });

    expect(result.title).toBe("Bitcoin supererà 150.000 USD?");
    expect(result.description).toBe("Domanda macro.");
    expect(result.category).toBe("Economia");
    expect(result.closesAt.toISOString()).toBe("2026-09-01T10:00:00.000Z");
    expect(result.resolution).toEqual({
      sourceUrl: "https://www.coingecko.com/en/coins/bitcoin",
      authorityHost: "coingecko.com",
      criteriaYes: "BTC >= 150k",
      criteriaNo: null,
    });
    expect(result.passthrough).toEqual({
      score: 91,
      sourceStorylineId: "story-1",
    });
  });

  it("preserves governance audit payloads for object, primitive and array inputs", () => {
    expect(
      toGovernanceAuditEvent({
        action: "EVENT_RESOLVE",
        entityType: "event",
        entityId: "evt-1",
        payload: { source: "legacy", reason: "manual" },
      })
    ).toEqual({
      actionKey: "EVENT_RESOLVE",
      targetType: "event",
      targetId: "evt-1",
      details: { source: "legacy", reason: "manual" },
    });

    expect(
      toGovernanceAuditEvent({
        action: "PIPELINE_MARKET_CREATED",
        entityType: "event",
        payload: "shadow-only",
      }).details
    ).toEqual({ value: "shadow-only" });

    expect(
      toGovernanceAuditEvent({
        action: "PIPELINE_MARKET_CREATED",
        entityType: "event",
        payload: ["a", "b"],
      }).details
    ).toEqual({ items: ["a", "b"] });
  });

  it("keeps wallet credits read-model compatible with legacy JSON consumers", () => {
    const result = toCreditsReadModel({
      credits: 12,
      creditsMicros: 5_900_000n,
    });

    expect(result).toEqual({
      displayCredits: 5,
      microsBalance: "5900000",
    });
  });
});

describe("manual submission to candidate adapter (MDE path)", () => {
  it("maps draft and normalized category to event-gen-v2 Candidate with manual source", () => {
    const draft = toCandidateDraftContract({
      title: "L'Inter vincerà lo scudetto?",
      description: "Match point.",
      category: "Sport",
      closesAt: "2026-07-01T12:00:00.000Z",
      resolutionSource: "https://example.com/inter",
    });
    const candidate = manualDraftToCandidate(draft, "Sport");

    expect(candidate.title).toBe("L'Inter vincerà lo scudetto?");
    expect(candidate.description).toBe("Match point.");
    expect(candidate.category).toBe("Sport");
    expect(candidate.closesAt).toEqual(draft.closesAt);
    expect(candidate.sourceStorylineId).toBe("manual");
    expect(candidate.templateId).toBe("manual");
    expect(candidate.resolutionAuthorityType).toBe("REPUTABLE");
    expect(candidate.resolutionAuthorityHost).toBe("example.com");
    expect(candidate.resolutionSourceUrl).toBe("https://example.com/inter");
    expect(candidate.timezone).toBe("Europe/Rome");
  });

  it("uses manual.submission host when resolutionSourceUrl is missing", () => {
    const draft = toCandidateDraftContract({
      title: "Event without source?",
      description: null,
      category: "Sport",
      closesAt: "2026-07-01T12:00:00.000Z",
      resolutionSource: null,
    });
    const candidate = manualDraftToCandidate(draft, "Sport");

    expect(candidate.resolutionAuthorityHost).toBe("manual.submission");
    expect(candidate.resolutionSourceUrl).toBeNull();
  });
});
