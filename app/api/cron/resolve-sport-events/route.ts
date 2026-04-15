/**
 * Cron route — SENTINEL Sport Event Resolution
 *
 * Runs every 30 minutes. For each open SPORT event whose
 * closesAt + resolutionBufferHours has elapsed:
 *   1. Updates live match statuses via API-Football
 *   2. Routes to Oracle L1/L2/L3 based on sport_market_kind
 *   3. Auto-resolves L1 events, flags L2/L3 as NEEDS_REVIEW
 *   4. Logs every action to AuditLog
 *
 * Schedule: every 30 minutes (Vercel Cron: *​/30 * * * *)
 * Endpoint: POST /api/cron/resolve-sport-events
 *
 * Auth: Bearer token via header Authorization or query param ?secret=
 *
 * Env vars:
 *   CRON_SECRET               — shared secret with Vercel Cron
 *   DISABLE_CRON_AUTOMATION   — if "true", disables all crons
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { runSentinel } from "@/lib/football-engine/sentinel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

function getSecret(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const url = new URL(request.url);
  return url.searchParams.get("secret");
}

export async function POST(request: Request) {
  const startTime = Date.now();

  if (
    process.env.DISABLE_CRON_AUTOMATION === "true" ||
    process.env.DISABLE_CRON_AUTOMATION === "1"
  ) {
    return NextResponse.json(
      { error: "Cron automation disabled", code: "CRON_DISABLED" },
      { status: 503 }
    );
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[SENTINEL Cron] CRON_SECRET not configured");
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }

  const provided = getSecret(request);
  if (!provided || provided !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[SENTINEL Cron] Starting resolution run");

  try {
    const sentinelResult = await runSentinel();

    const durationMs = Date.now() - startTime;

    await createAuditLog(prisma, {
      userId: null,
      action: "SENTINEL_CRON_RUN",
      entityType: "CRON",
      entityId: null,
      payload: {
        timestamp: sentinelResult.timestamp,
        durationMs,
        eligible: sentinelResult.resolution.eligible,
        autoResolved: sentinelResult.resolution.autoResolved.length,
        needsReview: sentinelResult.resolution.needsReview.length,
        errors: sentinelResult.resolution.errors.length,
        liveUpdated: sentinelResult.liveMonitor.updatedEvents,
      },
    }).catch((err: unknown) => {
      console.warn("[SENTINEL Cron] AuditLog failed:", err instanceof Error ? err.message : err);
    });

    console.log(
      `[SENTINEL Cron] Done in ${(durationMs / 1000).toFixed(1)}s — resolved:${sentinelResult.resolution.autoResolved.length} review:${sentinelResult.resolution.needsReview.length} errors:${sentinelResult.resolution.errors.length}`
    );

    return NextResponse.json({
      success: true,
      ...sentinelResult,
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error("[SENTINEL Cron] Pipeline failed:", error);
    return NextResponse.json(
      {
        error: "SENTINEL resolution pipeline failed",
        details: error instanceof Error ? error.message : String(error),
        durationMs,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
