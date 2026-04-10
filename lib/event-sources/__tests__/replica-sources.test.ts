import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPolymarketMarkets } from "../polymarket";
import { fetchKalshiMarkets } from "../kalshi";

describe("replica sources", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.REPLICA_ENABLE_KALSHI;
  });

  it("normalizes polymarket markets", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: "pm-1",
            question: "Will test happen?",
            description: "Desc",
            endDate: "2030-01-10T00:00:00.000Z",
            outcomes: ["Yes", "No"],
            rules: "Rule text",
          },
        ],
      })
    );

    const markets = await fetchPolymarketMarkets({
      maxPerSource: 10,
      timeoutMs: 5_000,
      retryCount: 0,
      topPerCategory: 10,
      italyMinScore: 0.5,
      italyMinConfidence: 0.5,
      italyMaxRiskFlags: 3,
      maxTotalDefault: 10,
      requireAiTranslation: true,
      qualityThreshold: 0.5,
    });

    expect(markets.length).toBe(1);
    expect(markets[0].sourcePlatform).toBe("polymarket");
    expect(markets[0].outcomes.length).toBe(2);
  });

  it("normalizes polymarket multi-outcome payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: "pm-2",
            question: "Who will win?",
            description: "Desc",
            endDate: "2030-01-10T00:00:00.000Z",
            outcomes: JSON.stringify([
              { id: "juv", label: "Juventus" },
              { id: "int", label: "Inter" },
              { id: "rom", label: "Roma" },
            ]),
            rules: "Rule text",
          },
        ],
      })
    );

    const markets = await fetchPolymarketMarkets({
      maxPerSource: 10,
      timeoutMs: 5_000,
      retryCount: 0,
      topPerCategory: 10,
      italyMinScore: 0.5,
      italyMinConfidence: 0.5,
      italyMaxRiskFlags: 3,
      maxTotalDefault: 10,
      requireAiTranslation: true,
      qualityThreshold: 0.5,
    });

    expect(markets.length).toBe(1);
    expect(markets[0].outcomes.map((o) => o.key)).toEqual(["juv", "int", "rom"]);
    expect(markets[0].outcomes[0].label).toBe("Juventus");
  });

  it("normalizes kalshi markets", async () => {
    process.env.REPLICA_ENABLE_KALSHI = "true";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          markets: [
            {
              ticker: "KX1",
              title: "Will X happen",
              subtitle: "Market subtitle",
              close_time: "2030-01-10T00:00:00.000Z",
              rules_primary: "Rule",
              settlement_source: "https://www.cdc.gov/some-bulletin",
              volume: 12345,
            },
          ],
        }),
      })
    );

    const markets = await fetchKalshiMarkets({
      maxPerSource: 10,
      timeoutMs: 5_000,
      retryCount: 0,
      topPerCategory: 10,
      italyMinScore: 0.5,
      italyMinConfidence: 0.5,
      italyMaxRiskFlags: 3,
      maxTotalDefault: 10,
      requireAiTranslation: true,
      qualityThreshold: 0.5,
    });

    expect(markets.length).toBe(1);
    expect(markets[0].sourcePlatform).toBe("kalshi");
    expect(markets[0].outcomes.map((o) => o.key)).toEqual(["YES", "NO"]);
    expect(markets[0].provenance.rankMetric).toBe("volume");
    expect(markets[0].provenance.rankValue).toBe(12345);
    expect(markets[0].rulebook.resolutionAuthorityHost).toBe("cdc.gov");
  });
});
