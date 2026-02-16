import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runHourlyAggregation, truncateToHour } from "@/lib/analytics/aggregation";

export const dynamic = "force-dynamic";

/** Verify Authorization: Bearer with CRON_SECRET. */
function isAuthorized(request: NextRequest): { ok: true } | { ok: false; status: number; body: object } {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  const isProduction = process.env.VERCEL === "1";

  if (isProduction && !cronSecret) {
    return {
      ok: false,
      status: 503,
      body: { error: "CRON_SECRET non configurato" },
    };
  }
  if (!cronSecret) {
    return { ok: true };
  }
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token !== cronSecret) {
    return { ok: false, status: 401, body: { error: "Unauthorized" } };
  }
  return { ok: true };
}

/**
 * GET /api/cron/aggregate-metrics
 * Runs hourly aggregation for the previous full hour (or ?hour=ISO for a specific hour).
 * Protected by CRON_SECRET (Authorization: Bearer <secret>).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json(auth.body, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const hourParam = searchParams.get("hour");
    const hour = hourParam
      ? truncateToHour(new Date(hourParam))
      : undefined;

    const result = await runHourlyAggregation(prisma, { hour });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      hour: result.hour.toISOString(),
      bucketsWritten: result.bucketsWritten,
      errors: result.errors,
    });
  } catch (error) {
    console.error("[cron/aggregate-metrics] error:", error);
    return NextResponse.json(
      {
        error: "Errore nell'aggregazione metriche",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
