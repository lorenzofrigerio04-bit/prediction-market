import { describe, it, expect } from "vitest";
import { getHypeScore, rankByHypeAndItaly } from "./hype-scorer";
import type { NewsCandidate } from "@/lib/event-sources/types";

const recentPublishedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2h ago

describe("getHypeScore", () => {
  it("returns higher score for recent news", () => {
    const old = new Date(Date.now() - 200 * 60 * 60 * 1000).toISOString();
    const cRecent: NewsCandidate = {
      title: "A",
      snippet: "B",
      url: "https://reuters.com/a",
      sourceName: "Reuters",
      publishedAt: recentPublishedAt,
    };
    const cOld: NewsCandidate = { ...cRecent, publishedAt: old };
    expect(getHypeScore(cRecent)).toBeGreaterThan(getHypeScore(cOld));
  });

  it("uses feedback sourceWeights when provided", () => {
    const c: NewsCandidate = {
      title: "A",
      snippet: "B",
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
    const c: NewsCandidate = {
      title: "A",
      snippet: "B",
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
    const candidates: NewsCandidate[] = [
      { title: "O", snippet: "", url: "https://x.com/o", sourceName: "X", publishedAt: old },
      { title: "R", snippet: "", url: "https://y.com/r", sourceName: "Y", publishedAt: recentPublishedAt },
    ];
    const ranked = rankByHypeAndItaly(candidates, { boostItaly: false });
    expect(ranked[0].title).toBe("R");
  });

  it("prioritizes high-performing sources when sourceWeights provided", () => {
    const sameTime = recentPublishedAt;
    const candidates: NewsCandidate[] = [
      { title: "Low", snippet: "", url: "https://low-performer.com/a", sourceName: "Low", publishedAt: sameTime },
      { title: "High", snippet: "", url: "https://high-performer.com/b", sourceName: "High", publishedAt: sameTime },
    ];
    const ranked = rankByHypeAndItaly(candidates, {
      boostItaly: false,
      sourceWeights: { "low-performer.com": 0.5, "high-performer.com": 1 },
    });
    expect(ranked[0].title).toBe("High");
  });
});
