import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  parseOutcomeFromContent,
  checkResolutionSource,
  getClosedUnresolvedEvents,
  fetchResolutionSource,
} from "../auto-resolve";

describe("parseOutcomeFromContent", () => {
  it("parses JSON with outcome YES", () => {
    expect(
      parseOutcomeFromContent('{"outcome":"YES"}', "application/json")
    ).toBe("YES");
    expect(
      parseOutcomeFromContent('{"result":"yes"}', "application/json")
    ).toBe("YES");
    expect(
      parseOutcomeFromContent('{"resolved":true}', "application/json")
    ).toBe("YES");
  });

  it("parses JSON with outcome NO", () => {
    expect(
      parseOutcomeFromContent('{"outcome":"NO"}', "application/json")
    ).toBe("NO");
    expect(
      parseOutcomeFromContent('{"result":"no"}', "application/json")
    ).toBe("NO");
    expect(
      parseOutcomeFromContent('{"resolved":false}', "application/json")
    ).toBe("NO");
  });

  it("returns null for ambiguous or missing JSON", () => {
    expect(
      parseOutcomeFromContent("{}", "application/json")
    ).toBeNull();
    expect(
      parseOutcomeFromContent('{"other": 1}', "application/json")
    ).toBeNull();
    expect(
      parseOutcomeFromContent("not json", "application/json")
    ).toBeNull();
  });

  it("parses text with explicit outcome YES pattern", () => {
    expect(
      parseOutcomeFromContent('result: "yes"', "text/html")
    ).toBe("YES");
    expect(
      parseOutcomeFromContent('"outcome" : "YES"', "text/plain")
    ).toBe("YES");
  });

  it("parses text with explicit outcome NO pattern", () => {
    expect(
      parseOutcomeFromContent('result: "no"', "text/html")
    ).toBe("NO");
    expect(
      parseOutcomeFromContent('"outcome" : "NO"', "text/plain")
    ).toBe("NO");
  });

  it("returns null when text has both YES and NO or neither", () => {
    expect(
      parseOutcomeFromContent("outcome: yes and result: no", "text/plain")
    ).toBeNull();
    expect(
      parseOutcomeFromContent("random page content", "text/html")
    ).toBeNull();
  });
});

function mockResponse(
  body: string,
  contentType: string,
  ok = true,
  status = 200
) {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Not Found",
    headers: {
      get(name: string) {
        return name.toLowerCase() === "content-type" ? contentType : null;
      },
    },
    text: () => Promise.resolve(body),
  };
}

describe("fetchResolutionSource", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("json")) {
          return Promise.resolve(
            mockResponse('{"outcome":"YES"}', "application/json")
          );
        }
        if (url.includes("fail")) {
          return Promise.resolve(
            mockResponse("", "", false, 404)
          );
        }
        return Promise.resolve(
          mockResponse("<html>result: yes</html>", "text/html")
        );
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns content and contentType", async () => {
    const out = await fetchResolutionSource("https://example.com/json");
    expect(out.content).toBe('{"outcome":"YES"}');
    expect(out.contentType).toContain("application/json");
  });

  it("throws on HTTP error", async () => {
    await expect(
      fetchResolutionSource("https://example.com/fail")
    ).rejects.toThrow("HTTP 404");
  });
});

describe("checkResolutionSource", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string) =>
        Promise.resolve(
          mockResponse('{"outcome":"YES"}', "application/json")
        )
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns outcome YES when source has clear YES", async () => {
    const result = await checkResolutionSource("https://example.com/yes");
    expect(result).toEqual({ outcome: "YES" });
  });

  it("returns outcome NO when source has clear NO", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          mockResponse('{"outcome":"NO"}', "application/json")
        )
      )
    );
    const result = await checkResolutionSource("https://example.com/no");
    expect(result).toEqual({ outcome: "NO" });
  });

  it("returns needsReview when outcome cannot be parsed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(mockResponse("{}", "application/json"))
      )
    );
    const result = await checkResolutionSource("https://example.com/ambiguous");
    expect(result).toEqual({ needsReview: true });
  });

  it("returns error when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("Network error")))
    );
    const result = await checkResolutionSource("https://example.com/error");
    expect("error" in result).toBe(true);
    expect((result as { error: string }).error).toContain("Network error");
  });
});

describe("getClosedUnresolvedEvents", () => {
  it("returns events with closesAt <= now and resolved false", async () => {
    const now = new Date();
    const events = [
      {
        id: "e1",
        title: "Event 1",
        closesAt: new Date(now.getTime() - 1000),
        resolutionSourceUrl: "https://example.com/1",
        resolutionStatus: "PENDING",
      },
    ];
    const prisma = {
      event: {
        findMany: vi.fn().mockResolvedValue(events),
      },
    } as unknown as PrismaClient;

    const result = await getClosedUnresolvedEvents(prisma);
    expect(result).toEqual(events);
    expect(prisma.event.findMany).toHaveBeenCalledWith({
      where: { closesAt: { lte: expect.any(Date) }, resolved: false },
      select: {
        id: true,
        title: true,
        closesAt: true,
        resolutionSourceUrl: true,
        resolutionStatus: true,
      },
      orderBy: { closesAt: "asc" },
    });
  });
});
