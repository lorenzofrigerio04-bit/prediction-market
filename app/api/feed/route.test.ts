/**
 * Integration tests for GET /api/feed: auth, pagination, reranking (diversity + freshness).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetServerSession = vi.fn();
const mockFindMany = vi.fn();
const mockGenerateFeedCandidates = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: () => mockGetServerSession(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: { findMany: (...args: unknown[]) => mockFindMany(...args) },
  },
}));

vi.mock("@/lib/personalization/candidate-generation", () => ({
  generateFeedCandidates: (...args: unknown[]) => mockGenerateFeedCandidates(...args),
}));

describe("GET /api/feed", () => {
  const now = new Date();
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const recent = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const old = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  function event(id: string, category: string, createdAt: Date) {
    return {
      id,
      description: null,
      category,
      createdAt,
      closesAt: future,
      probability: 50,
      totalCredits: 100,
      resolved: false,
      outcome: null,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "feed-test-user" } });
    mockGenerateFeedCandidates.mockResolvedValue([
      { eventId: "e1", source: "trending" },
      { eventId: "e2", source: "trending" },
      { eventId: "e3", source: "personalized" },
      { eventId: "e4", source: "personalized" },
      { eventId: "e5", source: "exploration" },
    ]);
    mockFindMany.mockImplementation(({ where }: { where: { id: { in: string[] } } }) => {
      const ids = where.id.in;
      const events = [
        event("e1", "Sport", recent),
        event("e2", "Sport", old),
        event("e3", "Tech", recent),
        event("e4", "Tech", old),
        event("e5", "Politics", old),
      ];
      return Promise.resolve(events.filter((e) => ids.includes(e.id)));
    });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/feed?limit=20");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Non autenticato");
  });

  it("returns personalized feed with items and pagination", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/feed?limit=20&offset=0");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.pagination).toEqual({
      total: expect.any(Number),
      limit: 20,
      offset: 0,
      hasMore: expect.any(Boolean),
    });
    expect(data.pagination.total).toBeGreaterThanOrEqual(data.items.length);
    if (data.items.length > 0) {
      expect(data.items[0]).toMatchObject({
        id: expect.any(String),
        category: expect.any(String),
        createdAt: expect.any(String),
        closesAt: expect.any(String),
      });
    }
  });

  it("respects limit and offset for pagination", async () => {
    const { GET } = await import("./route");
    const req1 = new NextRequest("http://localhost/api/feed?limit=2&offset=0");
    const res1 = await GET(req1);
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.items.length).toBeLessThanOrEqual(2);
    expect(data1.pagination.limit).toBe(2);
    expect(data1.pagination.offset).toBe(0);

    const req2 = new NextRequest("http://localhost/api/feed?limit=2&offset=2");
    const res2 = await GET(req2);
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.pagination.offset).toBe(2);
    expect(data2.pagination.hasMore).toBe(data2.pagination.total > 4);
  });

  it("returns empty feed when no candidates", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "empty-feed-user" } });
    mockGenerateFeedCandidates.mockResolvedValue([]);
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/feed?limit=20");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toEqual([]);
    expect(data.pagination).toEqual({ total: 0, limit: 20, offset: 0, hasMore: false });
  });

  it("calls candidate generation with authenticated userId", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "call-check-user" } });
    mockGenerateFeedCandidates.mockResolvedValue([
      { eventId: "e1", source: "trending" },
      { eventId: "e2", source: "trending" },
    ]);
    mockFindMany.mockResolvedValue([
      event("e1", "Sport", now),
      event("e2", "Tech", now),
    ]);
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/feed?limit=20");
    await GET(req);
    expect(mockGenerateFeedCandidates).toHaveBeenCalledWith(
      expect.anything(),
      "call-check-user",
      expect.any(Number)
    );
  });
});
