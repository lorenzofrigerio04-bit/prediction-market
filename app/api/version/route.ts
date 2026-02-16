/**
 * Version endpoint: commit hash + build time for deployment verification.
 * GET /api/version — no auth required. Use to confirm which build is live.
 */
import { NextRequest, NextResponse } from "next/server";
import { getCanonicalBaseUrl, warnNextAuthUrlIfInvalid } from "@/lib/canonical-base-url";

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

  warnNextAuthUrlIfInvalid();
  const baseUrl = getCanonicalBaseUrl();

  const buildTime =
    process.env.BUILD_TIME || new Date().toISOString();

  return { commit, buildTime, env, baseUrl };
}

export async function GET(_request: NextRequest) {
  const payload = getVersionPayload();

  // Runtime self-check: ensure we never expose baseUrl with /api
  if (payload.baseUrl.endsWith("/api")) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[version] self-check failed: baseUrl must not end with /api");
    }
  } else if (process.env.NODE_ENV !== "test") {
    console.info(
      `[version] self-check OK: env=${payload.env} commit=${payload.commit.slice(0, 7)} baseUrl=${payload.baseUrl}`
    );
  }

  return NextResponse.json(payload);
}
