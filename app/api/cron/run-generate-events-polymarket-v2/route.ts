import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runPolymarketV2Pipeline } from "@/lib/polymarket-v2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_TOTAL_MIN = 1;
const MAX_TOTAL_MAX = 800;

const CRON_DISABLED_JSON = { error: "Cron automation disabled", code: "CRON_DISABLED" as const };
const CRON_DISABLED_STATUS = 503;

function getSecretFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");
  if (secretParam) {
    return secretParam;
  }

  return null;
}

function getMaxTotalFromRequest(request: Request): number | undefined {
  const url = new URL(request.url);
  const rawMaxTotal = url.searchParams.get("maxTotal");
  if (!rawMaxTotal) return undefined;

  const parsed = Number(rawMaxTotal);
  if (!Number.isInteger(parsed)) return undefined;
  if (parsed < MAX_TOTAL_MIN || parsed > MAX_TOTAL_MAX) return undefined;
  return parsed;
}

export async function POST(request: Request) {
  try {
    if (process.env.DISABLE_CRON_AUTOMATION === "true" || process.env.DISABLE_CRON_AUTOMATION === "1") {
      return NextResponse.json(CRON_DISABLED_JSON, { status: CRON_DISABLED_STATUS });
    }

    if (process.env.DISABLE_EVENT_GENERATION === "true") {
      return NextResponse.json({
        success: true,
        disabled: true,
        message: "Event generation is disabled",
      });
    }

    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.warn("[Cron Polymarket V2] CRON_SECRET not set");
      return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
    }

    const providedSecret = getSecretFromRequest(request);
    if (!providedSecret || providedSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const maxTotal = getMaxTotalFromRequest(request);
    const result = await runPolymarketV2Pipeline({
      prisma,
      now,
      dryRun: false,
      ...(maxTotal != null && { maxTotal }),
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      pipelineVersion: "polymarket-2.0",
      dryRun: false,
      maxTotalUsed: maxTotal ?? null,
      ...result,
    });
  } catch (error) {
    console.error("[Cron Polymarket V2] Error running pipeline:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
