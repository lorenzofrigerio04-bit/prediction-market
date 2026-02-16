/**
 * Unit tests for market scoring (personalization).
 */

import { describe, it, expect } from "vitest";
import {
  getMarketHorizon,
  getMarketRiskLevel,
  scoreMarketForUser,
  type FeedMarket,
  type UserProfileView,
} from "./scoring";

const now = new Date();

function market(overrides: Partial<FeedMarket> = {}): FeedMarket {
  return {
    id: "ev-1",
    category: "Sport",
    closesAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    totalCredits: 1000,
    b: 100,
    volume_6h: 50,
    impressions: 100,
    ...overrides,
  };
}

function profile(overrides: Partial<UserProfileView> = {}): UserProfileView {
  return {
    preferredCategories: { Sport: 1, Tech: 0.5 },
    riskTolerance: "MEDIUM",
    preferredHorizon: "MEDIUM",
    ...overrides,
  };
}

describe("getMarketHorizon", () => {
  it("returns SHORT when closes within 7 days", () => {
    expect(
      getMarketHorizon(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000))
    ).toBe("SHORT");
  });

  it("returns MEDIUM when closes in 7–30 days", () => {
    expect(
      getMarketHorizon(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000))
    ).toBe("MEDIUM");
    expect(
      getMarketHorizon(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
    ).toBe("MEDIUM");
  });

  it("returns LONG when closes after 30 days", () => {
    expect(
      getMarketHorizon(new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000))
    ).toBe("LONG");
  });
});

describe("getMarketRiskLevel", () => {
  it("returns LOW for high totalCredits", () => {
    expect(getMarketRiskLevel({ totalCredits: 3000 })).toBe("LOW");
    expect(getMarketRiskLevel({ totalCredits: 2000 })).toBe("LOW");
  });

  it("returns MEDIUM for mid totalCredits", () => {
    expect(getMarketRiskLevel({ totalCredits: 1000 })).toBe("MEDIUM");
  });

  it("returns HIGH for low totalCredits", () => {
    expect(getMarketRiskLevel({ totalCredits: 500 })).toBe("HIGH");
    expect(getMarketRiskLevel({ totalCredits: 100 })).toBe("HIGH");
  });
});

describe("scoreMarketForUser", () => {
  it("returns higher score for preferred category", () => {
    const m = market({ category: "Sport" });
    const pSport = profile({ preferredCategories: { Sport: 1 } });
    const pTech = profile({ preferredCategories: { Tech: 1 } });
    expect(scoreMarketForUser(m, pSport)).toBeGreaterThan(
      scoreMarketForUser(m, pTech)
    );
  });

  it("returns higher score when risk matches", () => {
    const m = market({ totalCredits: 3000 });
    const pLow = profile({ riskTolerance: "LOW" });
    const pHigh = profile({ riskTolerance: "HIGH" });
    expect(scoreMarketForUser(m, pLow)).toBeGreaterThan(
      scoreMarketForUser(m, pHigh)
    );
  });

  it("returns higher score when horizon matches", () => {
    const m = market({
      closesAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    });
    const pMed = profile({ preferredHorizon: "MEDIUM" });
    const pShort = profile({ preferredHorizon: "SHORT" });
    expect(scoreMarketForUser(m, pMed)).toBeGreaterThan(
      scoreMarketForUser(m, pShort)
    );
  });

  it("returns a number in a reasonable range", () => {
    const m = market();
    const p = profile();
    const s = scoreMarketForUser(m, p);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(2);
  });
});
