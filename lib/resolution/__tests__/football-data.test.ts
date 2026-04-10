import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/football-data-org/client", () => ({
  fetchMatchById: vi.fn(),
  getBinaryOutcomeFromMatch: vi.fn(),
}));

import { resolveSportEventByMatchId } from "../football-data";
import { fetchMatchById, getBinaryOutcomeFromMatch } from "@/lib/football-data-org/client";

describe("resolveSportEventByMatchId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves total-goals multi-choice market", async () => {
    vi.mocked(fetchMatchById).mockResolvedValue({
      id: 100,
      status: "FINISHED",
      score: { fullTime: { home: 2, away: 2 } },
    } as any);

    const result = await resolveSportEventByMatchId({
      footballDataMatchId: 100,
      marketType: "MULTIPLE_CHOICE",
      templateId: "sport-football-total-goals",
      creationMetadata: { sport_market_kind: "TOTAL_GOALS_BUCKETS" },
    });

    expect(result).toEqual({ outcome: "goals_4_plus" });
  });

  it("falls back to binary resolution for binary markets", async () => {
    vi.mocked(fetchMatchById).mockResolvedValue({
      id: 101,
      status: "FINISHED",
      score: { winner: "HOME_TEAM" },
    } as any);
    vi.mocked(getBinaryOutcomeFromMatch).mockReturnValue("YES");

    const result = await resolveSportEventByMatchId({
      footballDataMatchId: 101,
      marketType: "BINARY",
      templateId: "sport-football-fixture",
    });

    expect(result).toEqual({ outcome: "YES" });
  });

  it("resolves match-script multi-choice market", async () => {
    vi.mocked(fetchMatchById).mockResolvedValue({
      id: 102,
      status: "FINISHED",
      score: { fullTime: { home: 3, away: 1 } },
    } as any);

    const result = await resolveSportEventByMatchId({
      footballDataMatchId: 102,
      marketType: "MULTIPLE_CHOICE",
      templateId: "sport-football-match-script",
      creationMetadata: { sport_market_kind: "MATCH_SCRIPT_3WAY" },
    });

    expect(result).toEqual({ outcome: "home_statement" });
  });

  it("resolves half-time-state multi-choice market", async () => {
    vi.mocked(fetchMatchById).mockResolvedValue({
      id: 103,
      status: "FINISHED",
      score: { halfTime: { home: 0, away: 0 }, fullTime: { home: 1, away: 0 } },
    } as any);

    const result = await resolveSportEventByMatchId({
      footballDataMatchId: 103,
      marketType: "MULTIPLE_CHOICE",
      templateId: "sport-football-half-time-state",
      creationMetadata: { sport_market_kind: "HALF_TIME_STATE_3WAY" },
    });

    expect(result).toEqual({ outcome: "ht_level" });
  });

  it("resolves comeback-swap binary market", async () => {
    vi.mocked(fetchMatchById).mockResolvedValue({
      id: 104,
      status: "FINISHED",
      score: { halfTime: { home: 1, away: 0 }, fullTime: { home: 1, away: 2 } },
    } as any);

    const result = await resolveSportEventByMatchId({
      footballDataMatchId: 104,
      marketType: "BINARY",
      templateId: "sport-football-comeback-swap",
      creationMetadata: { sport_market_kind: "COMEBACK_SWAP_LEADER" },
    });

    expect(result).toEqual({ outcome: "YES" });
  });
});

