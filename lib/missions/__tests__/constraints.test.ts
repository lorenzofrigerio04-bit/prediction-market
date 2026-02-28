/**
 * Unit tests for mission constraint validation.
 */
import { describe, it, expect } from "vitest";
import { validateConstraints } from "../constraints";
import type { UserStats } from "../user-stats";

const baseStats: UserStats = {
  totalPredictions: 20,
  resolvedPredictions: 10,
  wins: 6,
  losses: 4,
  winStreakCurrent: 2,
  loginStreakCurrent: 5,
  accuracyPercent: 60,
  categoriesUsedCount: 3,
  categoriesByCount: [
    { category: "Sport", count: 2 },
    { category: "Tech", count: 5 },
    { category: "Politica", count: 13 },
  ],
  underusedCategories: ["Sport", "Tech"],
  weeklyRealizedPlMicros: 0,
};

describe("validateConstraints", () => {
  it("returns true when constraints is null", () => {
    expect(
      validateConstraints(null, { category: "Sport" }, baseStats)
    ).toBe(true);
  });

  it("returns true when constraints is empty object", () => {
    expect(
      validateConstraints("{}", { category: "Sport" }, baseStats)
    ).toBe(true);
  });

  it("fails when minProbability not met", () => {
    expect(
      validateConstraints(
        JSON.stringify({ minProbability: 0.6 }),
        { category: "Sport", probability: 0.5 },
        baseStats
      )
    ).toBe(false);
  });

  it("passes when probability meets minProbability", () => {
    expect(
      validateConstraints(
        JSON.stringify({ minProbability: 0.6 }),
        { category: "Sport", probability: 0.65 },
        baseStats
      )
    ).toBe(true);
  });

  it("fails when category does not match", () => {
    expect(
      validateConstraints(
        JSON.stringify({ category: "Tech" }),
        { category: "Sport" },
        baseStats
      )
    ).toBe(false);
  });

  it("passes when category matches", () => {
    expect(
      validateConstraints(
        JSON.stringify({ category: "Sport" }),
        { category: "Sport" },
        baseStats
      )
    ).toBe(true);
  });

  it("fails when underusedCategory is true but category not in underused list", () => {
    expect(
      validateConstraints(
        JSON.stringify({ underusedCategory: true }),
        { category: "Politica" },
        baseStats
      )
    ).toBe(false);
  });

  it("passes when underusedCategory is true and category is underused", () => {
    expect(
      validateConstraints(
        JSON.stringify({ underusedCategory: true }),
        { category: "Sport" },
        baseStats
      )
    ).toBe(true);
  });

  it("fails when minResolved not met", () => {
    expect(
      validateConstraints(
        JSON.stringify({ minResolved: 20 }),
        {},
        baseStats
      )
    ).toBe(false);
  });

  it("passes when minResolved is met", () => {
    expect(
      validateConstraints(
        JSON.stringify({ minResolved: 5 }),
        {},
        baseStats
      )
    ).toBe(true);
  });
});
