import { describe, it, expect } from "vitest";
import {
  volumeRate,
  userRate,
  ctr,
  calculateSuccessScore,
  type HourlyMetrics,
} from "./metrics";

describe("volumeRate", () => {
  it("returns volume / hours", () => {
    expect(volumeRate(100, 1)).toBe(100);
    expect(volumeRate(200, 2)).toBe(100);
    expect(volumeRate(0, 1)).toBe(0);
  });
  it("returns 0 when hours <= 0", () => {
    expect(volumeRate(100, 0)).toBe(0);
    expect(volumeRate(100, -1)).toBe(0);
  });
});

describe("userRate", () => {
  it("returns uniqueUsers / hours", () => {
    expect(userRate(5, 1)).toBe(5);
    expect(userRate(10, 2)).toBe(5);
    expect(userRate(0, 1)).toBe(0);
  });
  it("returns 0 when hours <= 0", () => {
    expect(userRate(5, 0)).toBe(0);
  });
});

describe("ctr", () => {
  it("returns clicks / impressions", () => {
    expect(ctr(10, 100)).toBe(0.1);
    expect(ctr(1, 2)).toBe(0.5);
    expect(ctr(0, 100)).toBe(0);
  });
  it("returns 0 when impressions === 0", () => {
    expect(ctr(10, 0)).toBe(0);
    expect(ctr(0, 0)).toBe(0);
  });
});

describe("calculateSuccessScore", () => {
  it("computes (volumeRate*0.4) + (userRate*0.3) + (ctr*0.3) for 1 hour", () => {
    const m: HourlyMetrics = {
      volume: 100,
      uniqueUsers: 10,
      impressions: 200,
      clicks: 20,
    };
    // volumeRate=100, userRate=10, ctr=20/200=0.1
    // 100*0.4 + 10*0.3 + 0.1*0.3 = 40 + 3 + 0.03 = 43.03
    expect(calculateSuccessScore(m, 1)).toBeCloseTo(43.03, 5);
  });

  it("uses hours for rate normalization", () => {
    const m: HourlyMetrics = {
      volume: 120,
      uniqueUsers: 6,
      impressions: 0,
      clicks: 0,
    };
    // 2 hours: volumeRate=60, userRate=3, ctr=0
    // 60*0.4 + 3*0.3 + 0 = 24 + 0.9 = 24.9
    expect(calculateSuccessScore(m, 2)).toBeCloseTo(24.9, 5);
  });

  it("returns 0 for all-zero metrics", () => {
    expect(
      calculateSuccessScore(
        { volume: 0, uniqueUsers: 0, impressions: 0, clicks: 0 },
        1
      )
    ).toBe(0);
  });

  it("handles zero impressions (ctr = 0)", () => {
    const m: HourlyMetrics = {
      volume: 50,
      uniqueUsers: 5,
      impressions: 0,
      clicks: 10,
    };
    // ctr = 0, so 50*0.4 + 5*0.3 + 0 = 20 + 1.5 = 21.5
    expect(calculateSuccessScore(m, 1)).toBeCloseTo(21.5, 5);
  });
});
