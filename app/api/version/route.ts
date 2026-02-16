/**
 * Version endpoint: commit hash + build time for deployment verification.
 * GET /api/version — no auth required. Use to confirm which build is live.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const commitSha =
  typeof process.env.VERCEL_GIT_COMMIT_SHA === "string"
    ? process.env.VERCEL_GIT_COMMIT_SHA
    : process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? null;
const shortSha = commitSha ? commitSha.slice(0, 7) : "dev";

export async function GET() {
  return NextResponse.json({
    commit: shortSha,
    buildTime: new Date().toISOString(),
    env: process.env.VERCEL === "1" ? "vercel" : "local",
  });
}
