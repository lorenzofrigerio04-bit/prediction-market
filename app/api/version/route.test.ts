/**
 * Minimal tests for GET /api/version: shape, env detection, origin-only baseUrl.
 */
import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";

describe("GET /api/version", () => {
  const savedEnv: Record<string, string | undefined> = {};

  function saveEnv(keys: string[]) {
    for (const k of keys) {
      savedEnv[k] = process.env[k];
    }
  }

  function restoreEnv() {
    for (const [k, v] of Object.entries(savedEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }

  afterEach(() => {
    restoreEnv();
  });

  it("returns JSON with commit, buildTime, env, baseUrl and baseUrl never ends with /api", async () => {
    saveEnv(["VERCEL", "VERCEL_URL", "PORT", "VERCEL_GIT_COMMIT_SHA", "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA", "GIT_COMMIT_SHA"]);
    delete process.env.VERCEL;
    delete process.env.VERCEL_URL;
    process.env.PORT = "3000";

    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/version");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data).toMatchObject({
      commit: expect.any(String),
      buildTime: expect.any(String),
      env: "local",
      baseUrl: expect.stringMatching(/^http:\/\/localhost:\d+$/),
    });
    expect(data.baseUrl.endsWith("/api")).toBe(false);
    expect(data.commit).toBe("dev");
  });

  it("returns env=vercel and origin-only baseUrl when VERCEL is set", async () => {
    saveEnv(["VERCEL", "VERCEL_URL", "VERCEL_GIT_COMMIT_SHA"]);
    process.env.VERCEL = "1";
    process.env.VERCEL_URL = "myapp.vercel.app";
    process.env.VERCEL_GIT_COMMIT_SHA = "abc123def456";

    const { GET } = await import("./route");
    const req = new NextRequest("https://myapp.vercel.app/api/version");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.env).toBe("vercel");
    expect(data.baseUrl).toBe("https://myapp.vercel.app");
    expect(data.baseUrl.endsWith("/api")).toBe(false);
    expect(data.commit).toBe("abc123def456");
  });
});
