import { describe, expect, it } from "vitest";
import type { SourceMarket } from "@/lib/event-replica/types";
import { groupBinarySiblingsIntoMultiOutcome } from "../grouping";

function makeBinaryMarket(externalId: string, title: string): SourceMarket {
  return {
    externalId,
    sourcePlatform: "polymarket",
    sourceUrl: `https://polymarket.com/market/${externalId}`,
    title,
    description: "Test",
    category: "Politica",
    closeTime: new Date("2026-11-01T00:00:00.000Z"),
    outcomes: [
      { key: "YES", label: "Yes" },
      { key: "NO", label: "No" },
    ],
    rulebook: {
      sourceRaw: "Rules",
      resolutionSourceUrl: "https://polymarket.com",
      resolutionAuthorityHost: "polymarket.com",
      resolutionAuthorityType: "OFFICIAL",
      edgeCases: [],
      settlementNotes: "",
    },
    rawPayload: {},
    provenance: {
      sourcePlatform: "polymarket",
      externalId,
      sourceUrl: `https://polymarket.com/market/${externalId}`,
      fetchedAt: new Date().toISOString(),
      confidence: 0.8,
      riskFlags: [],
      rankMetric: "volume",
      rankValue: 1000,
    },
  };
}

describe("groupBinarySiblingsIntoMultiOutcome", () => {
  it("groups FIFA winner siblings into one multi-outcome market", () => {
    const markets = [
      makeBinaryMarket("a", "Will Brazil win FIFA World Cup 2026?"),
      makeBinaryMarket("b", "Will France win FIFA World Cup 2026?"),
      makeBinaryMarket("c", "Will Argentina win FIFA World Cup 2026?"),
    ];

    const grouped = groupBinarySiblingsIntoMultiOutcome({
      markets,
      minSiblings: 3,
      maxOutcomes: 20,
    });

    expect(grouped.groupedClusterCount).toBe(1);
    const synthetic = grouped.groupedMarkets.find((m) =>
      String((m.rawPayload as Record<string, unknown>)?.polymarket_v2_grouped) === "true"
    );
    expect(synthetic).toBeTruthy();
    expect(synthetic?.title).toBe("Which team will win FIFA World Cup 2026?");
    expect(synthetic?.outcomes.length).toBe(3);
  });

  it("groups nominee siblings into one multi-outcome market", () => {
    const markets = [
      makeBinaryMarket("n1", "Will Gavin Newsom be the Democratic nominee for President in 2028?"),
      makeBinaryMarket("n2", "Will Pete Buttigieg be the Democratic nominee for President in 2028?"),
      makeBinaryMarket("n3", "Will Kamala Harris be the Democratic nominee for President in 2028?"),
    ];

    const grouped = groupBinarySiblingsIntoMultiOutcome({
      markets,
      minSiblings: 3,
      maxOutcomes: 20,
    });

    const synthetic = grouped.groupedMarkets.find((m) =>
      String((m.rawPayload as Record<string, unknown>)?.polymarket_v2_grouped) === "true"
    );
    expect(synthetic).toBeTruthy();
    expect(synthetic?.title).toBe(
      "Who will be the Democratic nominee for President in 2028?"
    );
    expect(synthetic?.outcomes.map((o) => o.label)).toEqual(
      expect.arrayContaining(["Gavin Newsom", "Pete Buttigieg", "Kamala Harris"])
    );
  });
});

