/**
 * Version endpoint: commit hash + build time for deployment verification.
 * GET /api/version — no auth required. Use to confirm which build is live.
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getVersionPayload() {
  const isVercel =
    Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_URL);
  const env = isVercel ? "vercel" : "local";

  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    "dev";

  let baseUrl: string;
  if (isVercel && process.env.VERCEL_URL) {
    baseUrl = "https://" + process.env.VERCEL_URL;
  } else {
    const port = process.env.PORT || "3000";
    baseUrl = "http://localhost:" + port;
  }

  // Guard: baseUrl must be origin only (no "/api")
  if (baseUrl.endsWith("/api")) {
    baseUrl = baseUrl.replace(/\/api\/?$/, "") || baseUrl;
    if (env === "local") {
      console.warn("[version] baseUrl had trailing /api; stripped to origin only.");
    }
  }

  const buildTime =
    process.env.BUILD_TIME || new Date().toISOString();

  return { commit, buildTime, env, baseUrl };
}

export async function GET(request: NextRequest) {
  let payload = getVersionPayload();
  // Fallback: if on Vercel but VERCEL_URL was missing, use request origin so baseUrl is always present
  if (payload.env === "vercel" && (!payload.baseUrl || payload.baseUrl.startsWith("http://localhost"))) {
    const origin = request.nextUrl?.origin ?? request.url?.replace(/\/api\/version\/?$/, "").replace(/\/$/, "") ?? "";
    if (origin) payload = { ...payload, baseUrl: origin };
  }

  // Runtime self-check: ensure we never expose baseUrl with /api
  if (payload.baseUrl.endsWith("/api")) {
    if (payload.env === "local") {
      console.error("[version] self-check failed: baseUrl must not end with /api");
    }
  } else if (process.env.NODE_ENV !== "test") {
    console.info(
      `[version] self-check OK: env=${payload.env} commit=${payload.commit.slice(0, 7)} baseUrl=${payload.baseUrl}`
    );
  }

  return NextResponse.json(payload);
}
