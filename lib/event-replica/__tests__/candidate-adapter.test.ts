import { describe, expect, it } from "vitest";
import { buildReplicaCandidate } from "../candidate-adapter";
import type { SourceMarket } from "../types";

function baseMarket(): SourceMarket {
  return {
    externalId: "poly-1",
    sourcePlatform: "polymarket",
    sourceUrl: "https://polymarket.com/event/test",
    title: "Will X happen by date?",
    description: "Original description",
    category: "Politica",
    closeTime: new Date("2030-01-02T10:00:00.000Z"),
    outcomes: [
      { key: "YES", label: "Yes" },
      { key: "NO", label: "No" },
    ],
    rulebook: {
      sourceRaw: "Official source rules.",
      resolutionSourceUrl: "https://polymarket.com/",
      resolutionAuthorityHost: "polymarket.com",
      resolutionAuthorityType: "OFFICIAL",
      edgeCases: ["If invalid then review"],
      settlementNotes: "Settlement notes",
    },
    rawPayload: {},
    provenance: {
      sourcePlatform: "polymarket",
      externalId: "poly-1",
      sourceUrl: "https://polymarket.com/event/test",
      fetchedAt: new Date().toISOString(),
      confidence: 0.8,
      riskFlags: [],
    },
  };
}

describe("buildReplicaCandidate", () => {
  it("creates binary candidate with replica metadata", () => {
    const candidate = buildReplicaCandidate({
      market: baseMarket(),
      translated: {
        titleIt: "X accadrà entro la data?",
        descriptionIt: "Descrizione IT",
        rulebookIt: "Regole IT",
        edgeCasesIt: ["Caso limite"],
        confidence: 0.9,
        riskFlags: [],
      },
      interest: {
        score: 0.7,
        confidence: 0.6,
        riskFlags: [],
      },
    });

    expect(candidate.marketType).toBe("BINARY");
    expect(candidate.replica.sourcePlatform).toBe("polymarket");
    expect(candidate.sourceStorylineId).toContain("replica:polymarket");
    expect(candidate.creationMetadata).toBeTruthy();
  });

  it("creates multi-choice when outcomes > 2", () => {
    const market = baseMarket();
    market.outcomes = [
      { key: "A", label: "A" },
      { key: "B", label: "B" },
      { key: "C", label: "C" },
    ];

    const candidate = buildReplicaCandidate({
      market,
      translated: {
        titleIt: "Chi vincerà?",
        descriptionIt: "Descrizione IT",
        rulebookIt: "Regole IT",
        edgeCasesIt: [],
        confidence: 0.8,
        riskFlags: [],
      },
      interest: {
        score: 0.8,
        confidence: 0.8,
        riskFlags: [],
      },
    });

    expect(candidate.marketType).toBe("MULTIPLE_CHOICE");
    expect(candidate.outcomes?.length).toBe(3);
  });
});
