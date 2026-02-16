/**
 * Unit tests for feed reranking (diversity: max 2 per category in top 10, freshness: boost last 24h).
 */

import { describe, it, expect } from "vitest";
import { rerankFeed } from "./reranking";

function item(eventId: string, category: string, createdAt: Date) {
  return { eventId, category, createdAt };
}

describe("rerankFeed", () => {
  const now = Date.now();
  const recent = new Date(now - 12 * 60 * 60 * 1000);
  const old = new Date(now - 48 * 60 * 60 * 1000);

  it("returns empty array for empty input", () => {
    expect(rerankFeed([])).toEqual([]);
  });

  it("preserves order when all categories have ≤2 in first 10", () => {
    const items = [
      item("a1", "Sport", recent),
      item("a2", "Sport", recent),
      item("b1", "Tech", old),
      item("b2", "Tech", old),
    ];
    const out = rerankFeed(items, now);
    expect(out.map((x) => x.eventId)).toEqual(["a1", "a2", "b1", "b2"]);
  });

  it("enforces max 2 per category in top 10", () => {
    const categories = ["A", "B", "C", "D", "E"];
    const items: { eventId: string; category: string; createdAt: Date }[] = [];
    for (const cat of categories) {
      for (let i = 0; i < 3; i++) items.push(item(`${cat}${i}`, cat, old));
    }
    const out = rerankFeed(items, now);
    const top10 = out.slice(0, 10);
    const counts = new Map<string, number>();
    for (const x of top10) {
      counts.set(x.category, (counts.get(x.category) ?? 0) + 1);
    }
    for (const [, n] of counts) {
      expect(n).toBeLessThanOrEqual(2);
    }
    expect(out.length).toBe(15);
  });

  it("prioritizes recent items in top slots", () => {
    const items = [
      item("old1", "Sport", old),
      item("old2", "Tech", old),
      item("new1", "Sport", recent),
      item("new2", "Tech", recent),
    ];
    const out = rerankFeed(items, now);
    const top2 = out.slice(0, 2);
    const ids = top2.map((x) => x.eventId);
    expect(ids).toContain("new1");
    expect(ids).toContain("new2");
  });

  it("fills top 10 with diversity then appends rest", () => {
    const categories = ["A", "B", "C", "D", "E"];
    const items: { eventId: string; category: string; createdAt: Date }[] = [];
    for (const cat of categories) {
      for (let i = 0; i < 3; i++) items.push(item(`${cat}${i}`, cat, old));
    }
    const out = rerankFeed(items, now);
    const top10 = out.slice(0, 10);
    expect(top10.length).toBe(10);
    const counts = new Map<string, number>();
    for (const x of top10) counts.set(x.category, (counts.get(x.category) ?? 0) + 1);
    for (const [, n] of counts) expect(n).toBeLessThanOrEqual(2);
    expect(out.length).toBe(15);
  });
});
