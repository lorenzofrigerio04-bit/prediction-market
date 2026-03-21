import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { getPipelineMetrics } from "@/lib/event-gen-v2/metrics";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pipeline-metrics
 * Returns Event Gen v2 pipeline metrics (admin only).
 * Query: hoursBack (default 24) - hours to aggregate
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability("pipeline:run");

    const { searchParams } = new URL(request.url);
    const hoursBack = Math.min(
      168,
      Math.max(1, parseInt(searchParams.get("hoursBack") ?? "24", 10))
    );

    const metrics = await getPipelineMetrics(prisma, { hoursBack });

    return NextResponse.json({
      ok: true,
      hoursBack,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[admin/pipeline-metrics]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch pipeline metrics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
