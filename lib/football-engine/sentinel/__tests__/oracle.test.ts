import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  classifyOracleLevel,
  getMarketKind,
  isBufferElapsed,
  resolveEvent,
  type SportEventForOracle,
} from "../oracle";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/resolution/football-data", () => ({
  resolveSportEventByMatchId: vi.fn(),
}));

vi.mock("../../radar/clients/api-football", () => ({
  fetchFixtures: vi.fn(),
  fetchFixtureEvents: vi.fn(),
  fetchFixturePlayerStats: vi.fn(),
}));

vi.mock("../../radar/sources/news-rss", () => ({
  fetchFloatingNewsSignals: vi.fn(),
}));

vi.mock("../../radar/source-tiers", () => ({
  classifySourceByDomain: vi.fn(() => ({ tier: 3, reliability: 0.5 })),
}));

import { resolveSportEventByMatchId } from "@/lib/resolution/football-data";
import { fetchFixtures, fetchFixtureEvents, fetchFixturePlayerStats } from "../../radar/clients/api-football";
import { fetchFloatingNewsSignals } from "../../radar/sources/news-rss";

const mockResolveSport = vi.mocked(resolveSportEventByMatchId);
const mockFetchFixtures = vi.mocked(fetchFixtures);
const mockFetchEvents = vi.mocked(fetchFixtureEvents);
const mockFetchPlayerStats = vi.mocked(fetchFixturePlayerStats);
const mockFetchNews = vi.mocked(fetchFloatingNewsSignals);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvent(overrides: Partial<SportEventForOracle> = {}): SportEventForOracle {
  return {
    id: "evt-test-123",
    title: "Inter vs Juventus: chi vincerà?",
    closesAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h ago
    resolutionBufferHours: 3,
    footballDataMatchId: 42,
    marketType: "BINARY",
    templateId: "football-btts",
    creationMetadata: {
      sport_market_kind: "BOTH_TEAMS_TO_SCORE",
      fie_version: "1.0",
    },
    matchStatus: "FINISHED",
    ...overrides,
  };
}

function makeFinishedFixture(homeGoals: number, awayGoals: number, htHome = 0, htAway = 0) {
  return {
    fixture: { id: 999, referee: null, timezone: "UTC", date: "2026-04-10T20:00:00Z", timestamp: 0, venue: null, status: { long: "Match Finished", short: "FT", elapsed: 90 } },
    league: { id: 135, name: "Serie A", country: "Italy", logo: "", flag: null, season: 2025, round: "Regular Season - 30" },
    teams: { home: { id: 1, name: "Inter", logo: "", winner: null }, away: { id: 2, name: "Juventus", logo: "", winner: null } },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: { home: htHome, away: htAway },
      fulltime: { home: homeGoals, away: awayGoals },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  // Default: API-Football returns nothing (so no cross-validation happens)
  mockFetchFixtures.mockResolvedValue([]);
});

// ---------------------------------------------------------------------------
// classifyOracleLevel
// ---------------------------------------------------------------------------

describe("classifyOracleLevel", () => {
  it("returns 1 for L1 market kinds", () => {
    expect(classifyOracleLevel("FULL_TIME_RESULT_1X2")).toBe(1);
    expect(classifyOracleLevel("BOTH_TEAMS_TO_SCORE")).toBe(1);
    expect(classifyOracleLevel("OVER_2_5_GOALS")).toBe(1);
    expect(classifyOracleLevel("CLEAN_SHEET_ANY")).toBe(1);
    expect(classifyOracleLevel("TOTAL_GOALS_BUCKETS")).toBe(1);
    expect(classifyOracleLevel("HALF_TIME_STATE_3WAY")).toBe(1);
    expect(classifyOracleLevel("COMEBACK_SWAP_LEADER")).toBe(1);
    expect(classifyOracleLevel("FIRST_GOAL_TIMING")).toBe(1);
    expect(classifyOracleLevel("TOTAL_CARDS_RANGE")).toBe(1);
  });

  it("returns 2 for L2 market kinds", () => {
    expect(classifyOracleLevel("PLAYER_SHOTS_ON_TARGET")).toBe(2);
    expect(classifyOracleLevel("PLAYER_ANYTIME_SCORER")).toBe(2);
  });

  it("returns 3 for L3 market kinds", () => {
    expect(classifyOracleLevel("COACH_SACKING")).toBe(3);
    expect(classifyOracleLevel("TRANSFER_OFFICIAL")).toBe(3);
  });

  it("defaults to 3 for unknown kinds", () => {
    expect(classifyOracleLevel("UNKNOWN_KIND")).toBe(3);
    expect(classifyOracleLevel("")).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// getMarketKind
// ---------------------------------------------------------------------------

describe("getMarketKind", () => {
  it("extracts sport_market_kind from creationMetadata", () => {
    const event = makeEvent();
    expect(getMarketKind(event)).toBe("BOTH_TEAMS_TO_SCORE");
  });

  it("returns UNKNOWN when no metadata", () => {
    const event = makeEvent({ creationMetadata: null });
    expect(getMarketKind(event)).toBe("UNKNOWN");
  });
});

// ---------------------------------------------------------------------------
// isBufferElapsed
// ---------------------------------------------------------------------------

describe("isBufferElapsed", () => {
  it("returns true when buffer has elapsed", () => {
    const event = makeEvent({
      closesAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
      resolutionBufferHours: 3,
    });
    expect(isBufferElapsed(event)).toBe(true);
  });

  it("returns false when buffer has not elapsed", () => {
    const event = makeEvent({
      closesAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h ago
      resolutionBufferHours: 3,
    });
    expect(isBufferElapsed(event)).toBe(false);
  });

  it("returns true with 0 buffer hours when closesAt is past", () => {
    const event = makeEvent({
      closesAt: new Date(Date.now() - 1000),
      resolutionBufferHours: 0,
    });
    expect(isBufferElapsed(event)).toBe(true);
  });

  it("returns false when closesAt is in the future", () => {
    const event = makeEvent({
      closesAt: new Date(Date.now() + 60 * 60 * 1000),
      resolutionBufferHours: 0,
    });
    expect(isBufferElapsed(event)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resolveEvent — Level 1
// ---------------------------------------------------------------------------

describe("resolveEvent — L1", () => {
  it("auto-resolves BTTS YES when both sources agree", async () => {
    mockResolveSport.mockResolvedValue({ outcome: "YES" });
    // No cross-validation fixture found → trusts primary
    mockFetchFixtures.mockResolvedValue([]);

    const event = makeEvent({ creationMetadata: { sport_market_kind: "BOTH_TEAMS_TO_SCORE" } });
    const result = await resolveEvent(event);

    expect(result.level).toBe(1);
    expect(result.outcome).toBe("YES");
    expect(result.needsReview).toBe(false);
    expect(result.sources).toContain("football-data.org");
  });

  it("auto-resolves BTTS NO", async () => {
    mockResolveSport.mockResolvedValue({ outcome: "NO" });

    const event = makeEvent({ creationMetadata: { sport_market_kind: "BOTH_TEAMS_TO_SCORE" } });
    const result = await resolveEvent(event);

    expect(result.level).toBe(1);
    expect(result.outcome).toBe("NO");
    expect(result.needsReview).toBe(false);
  });

  it("returns needsReview when match not finished", async () => {
    mockResolveSport.mockResolvedValue({ needsReview: true });

    const event = makeEvent({ creationMetadata: { sport_market_kind: "OVER_2_5_GOALS" } });
    const result = await resolveEvent(event);

    expect(result.level).toBe(1);
    expect(result.needsReview).toBe(true);
    expect(result.outcome).toBeUndefined();
  });

  it("returns needsReview on primary source error", async () => {
    mockResolveSport.mockResolvedValue({ error: "Match not found" });

    const event = makeEvent({ creationMetadata: { sport_market_kind: "FULL_TIME_RESULT_1X2" } });
    const result = await resolveEvent(event);

    expect(result.level).toBe(1);
    expect(result.needsReview).toBe(true);
    expect(result.error).toBe("Match not found");
  });

  it("returns needsReview when no footballDataMatchId", async () => {
    const event = makeEvent({
      footballDataMatchId: null,
      creationMetadata: { sport_market_kind: "CLEAN_SHEET_ANY" },
    });
    const result = await resolveEvent(event);

    expect(result.level).toBe(1);
    expect(result.needsReview).toBe(true);
    expect(result.reason).toContain("footballDataMatchId");
  });

  it("flags NEEDS_REVIEW when API-Football disagrees", async () => {
    mockResolveSport.mockResolvedValue({ outcome: "YES" });
    mockFetchFixtures.mockResolvedValue([makeFinishedFixture(1, 0)] as never);

    const event = makeEvent({
      creationMetadata: {
        sport_market_kind: "BOTH_TEAMS_TO_SCORE",
        api_football_match_id: 999,
      },
    });
    const result = await resolveEvent(event);

    expect(result.level).toBe(1);
    expect(result.needsReview).toBe(true);
    expect(result.reason).toContain("disagree");
    expect(result.sources).toContain("api-football");
  });

  it("confirms when API-Football agrees on BTTS", async () => {
    mockResolveSport.mockResolvedValue({ outcome: "YES" });
    mockFetchFixtures.mockResolvedValue([makeFinishedFixture(2, 1)] as never);

    const event = makeEvent({
      creationMetadata: {
        sport_market_kind: "BOTH_TEAMS_TO_SCORE",
        api_football_match_id: 999,
      },
    });
    const result = await resolveEvent(event);

    expect(result.level).toBe(1);
    expect(result.outcome).toBe("YES");
    expect(result.needsReview).toBe(false);
  });

  it("resolves TOTAL_GOALS_BUCKETS correctly", async () => {
    mockResolveSport.mockResolvedValue({ outcome: "goals_4_plus" });
    mockFetchFixtures.mockResolvedValue([makeFinishedFixture(3, 2)] as never);

    const event = makeEvent({
      marketType: "RANGE",
      creationMetadata: {
        sport_market_kind: "TOTAL_GOALS_BUCKETS",
        api_football_match_id: 999,
      },
    });
    const result = await resolveEvent(event);

    expect(result.outcome).toBe("goals_4_plus");
    expect(result.needsReview).toBe(false);
  });

  it("resolves 1X2 home win", async () => {
    mockResolveSport.mockResolvedValue({ outcome: "result_home" });
    mockFetchFixtures.mockResolvedValue([makeFinishedFixture(2, 0)] as never);

    const event = makeEvent({
      marketType: "MULTIPLE_CHOICE",
      creationMetadata: {
        sport_market_kind: "FULL_TIME_RESULT_1X2",
        api_football_match_id: 999,
      },
    });
    const result = await resolveEvent(event);

    expect(result.outcome).toBe("result_home");
    expect(result.needsReview).toBe(false);
  });

  it("resolves CLEAN_SHEET_ANY YES", async () => {
    mockResolveSport.mockResolvedValue({ outcome: "YES" });
    mockFetchFixtures.mockResolvedValue([makeFinishedFixture(1, 0)] as never);

    const event = makeEvent({
      creationMetadata: {
        sport_market_kind: "CLEAN_SHEET_ANY",
        api_football_match_id: 999,
      },
    });
    const result = await resolveEvent(event);

    expect(result.outcome).toBe("YES");
    expect(result.needsReview).toBe(false);
  });

  it("resolves HALF_TIME_STATE_3WAY", async () => {
    mockResolveSport.mockResolvedValue({ outcome: "ht_home_lead" });
    mockFetchFixtures.mockResolvedValue([makeFinishedFixture(2, 1, 1, 0)] as never);

    const event = makeEvent({
      marketType: "MULTIPLE_CHOICE",
      creationMetadata: {
        sport_market_kind: "HALF_TIME_STATE_3WAY",
        api_football_match_id: 999,
      },
    });
    const result = await resolveEvent(event);

    expect(result.outcome).toBe("ht_home_lead");
    expect(result.needsReview).toBe(false);
  });

  it("resolves COMEBACK_SWAP_LEADER YES", async () => {
    // HT: home leads 1-0, FT: away wins 1-2
    mockResolveSport.mockResolvedValue({ outcome: "YES" });
    mockFetchFixtures.mockResolvedValue([makeFinishedFixture(1, 2, 1, 0)] as never);

    const event = makeEvent({
      creationMetadata: {
        sport_market_kind: "COMEBACK_SWAP_LEADER",
        api_football_match_id: 999,
      },
    });
    const result = await resolveEvent(event);

    expect(result.outcome).toBe("YES");
    expect(result.needsReview).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resolveEvent — Level 2
// ---------------------------------------------------------------------------

describe("resolveEvent — L2", () => {
  it("proposes outcome for PLAYER_ANYTIME_SCORER and flags review", async () => {
    mockFetchEvents.mockResolvedValue([
      {
        time: { elapsed: 55, extra: null },
        team: { id: 1, name: "Inter", logo: "" },
        player: { id: 10, name: "Lautaro Martinez" },
        assist: { id: null, name: null },
        type: "Goal",
        detail: "Normal Goal",
        comments: null,
      },
    ] as never);
    mockFetchPlayerStats.mockResolvedValue([]);

    const event = makeEvent({
      title: "Lautaro segnerà contro la Juventus?",
      creationMetadata: {
        sport_market_kind: "PLAYER_ANYTIME_SCORER",
        api_football_match_id: 999,
      },
    });

    const result = await resolveEvent(event);

    expect(result.level).toBe(2);
    expect(result.needsReview).toBe(true); // L2 always needs review
    expect(result.outcome).toBe("YES");
  });

  it("returns NEEDS_REVIEW with no outcome when player name cannot be extracted", async () => {
    mockFetchEvents.mockResolvedValue([]);
    mockFetchPlayerStats.mockResolvedValue([]);

    const event = makeEvent({
      title: "Qualcuno segnerà?",
      creationMetadata: {
        sport_market_kind: "PLAYER_ANYTIME_SCORER",
        api_football_match_id: 999,
      },
    });

    const result = await resolveEvent(event);

    expect(result.level).toBe(2);
    expect(result.needsReview).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// resolveEvent — Level 3
// ---------------------------------------------------------------------------

describe("resolveEvent — L3", () => {
  it("proposes YES when 3+ Tier 1-2 sources confirm", async () => {
    mockFetchNews.mockResolvedValue([
      { headline: "Allegri esonerato dalla Juventus", source: { name: "Sky Sport", tier: 2, id: "google-news-rss", reliability: 0.85 }, type: "news", id: "1", timestamp: "", confidence: 1, payload: {}, tags: [] },
      { headline: "Juventus esonera Allegri: è ufficiale", source: { name: "Gazzetta", tier: 2, id: "google-news-rss", reliability: 0.8 }, type: "news", id: "2", timestamp: "", confidence: 1, payload: {}, tags: [] },
      { headline: "Allegri fuori dalla Juventus, comunicato ufficiale", source: { name: "football-data.org", tier: 1, id: "football-data-org", reliability: 0.99 }, type: "news", id: "3", timestamp: "", confidence: 1, payload: {}, tags: [] },
    ] as never);

    const event = makeEvent({
      title: "Allegri verrà esonerato dalla Juventus?",
      footballDataMatchId: null,
      creationMetadata: { sport_market_kind: "COACH_SACKING" },
    });

    const result = await resolveEvent(event);

    expect(result.level).toBe(3);
    expect(result.needsReview).toBe(true); // L3 always needs review
    expect(result.outcome).toBe("YES");
    expect(result.sources.length).toBeGreaterThanOrEqual(3);
  });

  it("does not propose outcome with fewer than 3 sources", async () => {
    mockFetchNews.mockResolvedValue([
      { headline: "Allegri potrebbe essere esonerato", source: { name: "calciomercato.com", tier: 3, id: "google-news-rss", reliability: 0.6 }, type: "news", id: "1", timestamp: "", confidence: 1, payload: {}, tags: [] },
    ] as never);

    const event = makeEvent({
      title: "Allegri verrà esonerato?",
      footballDataMatchId: null,
      creationMetadata: { sport_market_kind: "COACH_SACKING" },
    });

    const result = await resolveEvent(event);

    expect(result.level).toBe(3);
    expect(result.outcome).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// resolveEvent — error handling
// ---------------------------------------------------------------------------

describe("resolveEvent — error safety", () => {
  it("returns error result on unexpected exception", async () => {
    mockResolveSport.mockRejectedValue(new Error("API down"));

    const event = makeEvent({ creationMetadata: { sport_market_kind: "OVER_2_5_GOALS" } });
    const result = await resolveEvent(event);

    expect(result.needsReview).toBe(true);
    expect(result.error).toContain("API down");
    // Event should NOT be resolved — status stays OPEN
  });

  it("cross-validation failure does not block resolution", async () => {
    mockResolveSport.mockResolvedValue({ outcome: "YES" });
    mockFetchFixtures.mockRejectedValue(new Error("Rate limited"));

    const event = makeEvent({
      creationMetadata: {
        sport_market_kind: "BOTH_TEAMS_TO_SCORE",
        api_football_match_id: 999,
      },
    });
    const result = await resolveEvent(event);

    expect(result.level).toBe(1);
    expect(result.outcome).toBe("YES");
    expect(result.needsReview).toBe(false);
  });
});
