import { describe, it, expect } from "vitest";
import { getHypeScore, rankByHypeAndItaly, type HypeCandidate } from "./hype-scorer";

const recentPublishedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2h ago

describe("getHypeScore", () => {
  it("returns higher score for recent news", () => {
    const old = new Date(Date.now() - 200 * 60 * 60 * 1000).toISOString();
    const cRecent: HypeCandidate = {
      url: "https://reuters.com/a",
      sourceName: "Reuters",
      publishedAt: recentPublishedAt,
    };
    const cOld: NewsCandidate = { ...cRecent, publishedAt: old };
    expect(getHypeScore(cRecent)).toBeGreaterThan(getHypeScore(cOld));
  });

  it("uses feedback sourceWeights when provided", () => {
    const c: HypeCandidate = {
      url: "https://reuters.com/article",
      sourceName: "Reuters",
      publishedAt: recentPublishedAt,
    };
    const without = getHypeScore(c);
    const withHigh = getHypeScore(c, { sourceWeights: { "reuters.com": 1 } });
    const withLow = getHypeScore(c, { sourceWeights: { "reuters.com": 0.5 } });
    expect(withHigh).toBeGreaterThanOrEqual(without);
    expect(withLow).toBeLessThan(without);
  });

  it("accepts custom recency/source weights", () => {
    const c: HypeCandidate = {
      url: "https://example.com/a",
      sourceName: "Example",
      publishedAt: recentPublishedAt,
    };
    const defaultScore = getHypeScore(c);
    const recencyHeavy = getHypeScore(c, { recencyWeight: 1, sourceWeight: 0 });
    expect(recencyHeavy).toBeGreaterThan(defaultScore);
  });
});

describe("rankByHypeAndItaly", () => {
  it("sorts by hype desc", () => {
    const old = new Date(Date.now() - 200 * 60 * 60 * 1000).toISOString();
    const candidates: HypeCandidate[] = [
      { url: "https://x.com/o", sourceName: "X", publishedAt: old },
      { url: "https://y.com/r", sourceName: "Y", publishedAt: recentPublishedAt },
    ];
    const ranked = rankByHypeAndItaly(candidates, { boostItaly: false });
    expect(ranked[0].url).toContain("y.com");
  });

  it("prioritizes high-performing sources when sourceWeights provided", () => {
    const sameTime = recentPublishedAt;
    const candidates: HypeCandidate[] = [
      { url: "https://low-performer.com/a", sourceName: "Low", publishedAt: sameTime },
      { url: "https://high-performer.com/b", sourceName: "High", publishedAt: sameTime },
    ];
    const ranked = rankByHypeAndItaly(candidates, {
      boostItaly: false,
      sourceWeights: { "low-performer.com": 0.5, "high-performer.com": 1 },
    });
    expect(ranked[0].url).toContain("high-performer");
  });
});
