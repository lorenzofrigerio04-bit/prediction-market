import { describe, expect, it } from "vitest";
import type { SourceMarket } from "@/lib/event-replica/types";
import { runFidelityGate } from "../fidelity-gate";
import { scoreMarketSoft } from "../scoring";
import { runValidityGate } from "../validity-gate";

function makeMarket(): SourceMarket {
  return {
    externalId: "pm-1",
    sourcePlatform: "polymarket",
    sourceUrl: "https://polymarket.com/event/x",
    title: "Will BTC close above 100000 by Dec 31, 2026?",
    description: "Test market",
    category: "Criptovalute",
    closeTime: new Date("2026-12-31T23:00:00.000Z"),
    outcomes: [
      { key: "YES", label: "Yes" },
      { key: "NO", label: "No" },
    ],
    rulebook: {
      sourceRaw: "Official source",
      resolutionSourceUrl: "https://polymarket.com/",
      resolutionAuthorityHost: "polymarket.com",
      resolutionAuthorityType: "OFFICIAL",
      edgeCases: ["if invalid market"],
      settlementNotes: "settlement note",
    },
    rawPayload: {},
    provenance: {
      sourcePlatform: "polymarket",
      externalId: "pm-1",
      sourceUrl: "https://polymarket.com/event/x",
      fetchedAt: new Date().toISOString(),
      confidence: 0.8,
      riskFlags: [],
      rankMetric: "volume",
      rankValue: 120_000,
    },
  };
}

describe("polymarket v2 gates", () => {
  it("passes validity gate for healthy market", () => {
    const result = runValidityGate(makeMarket(), new Date("2026-01-01T00:00:00.000Z"));
    expect(result.ok).toBe(true);
  });

  it("rejects validity gate when outcomes are broken", () => {
    const m = makeMarket();
    m.outcomes = [{ key: "YES", label: "" }];
    const result = runValidityGate(m, new Date("2026-01-01T00:00:00.000Z"));
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("insufficient_outcomes");
  });

  it("keeps fidelity when numeric tokens are preserved", () => {
    const m = makeMarket();
    const result = runFidelityGate(
      m,
      {
        titleIt: "Bitcoin chiuderà sopra 100000 entro il 31 dicembre 2026?",
        descriptionIt: "Descrizione",
        rulebookIt: "Regole complete",
        edgeCasesIt: ["se invalido"],
        confidence: 0.9,
        usedAI: true,
        riskFlags: [],
      },
      0.55
    );
    expect(result.ok).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0.55);
  });

  it("scores soft ranking with source signals", () => {
    const result = scoreMarketSoft(makeMarket());
    expect(result.score).toBeGreaterThan(0.5);
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});

