import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { runPolymarketV2Pipeline } from "@/lib/polymarket-v2";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

const MAX_TOTAL_MIN = 1;
const MAX_TOTAL_MAX = 800;

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminCapability("pipeline:run");

    if (process.env.DISABLE_EVENT_GENERATION === "true") {
      return NextResponse.json(
        { error: "Generazione eventi disabilitata (DISABLE_EVENT_GENERATION=true)" },
        { status: 403 }
      );
    }

    let maxTotal: number | undefined;
    const dryRun = false;
    try {
      const body = await request.json().catch(() => ({}));
      if (typeof body?.maxTotal === "number" && Number.isInteger(body.maxTotal)) {
        if (body.maxTotal >= MAX_TOTAL_MIN && body.maxTotal <= MAX_TOTAL_MAX) {
          maxTotal = body.maxTotal;
        }
      }
    } catch {
      // ignore invalid body
    }

    const now = new Date();
    const result = await runPolymarketV2Pipeline({
      prisma,
      now,
      dryRun,
      ...(maxTotal != null && { maxTotal }),
    });

    await createAuditLog(prisma, {
      userId: admin.id,
      action: "PIPELINE_RUN_POLYMARKET_V2",
      entityType: "pipeline",
      entityId: null,
      payload: {
        maxTotal: maxTotal ?? null,
        dryRun,
        createdCount: result.createdCount,
        updatedCount: result.updatedCount,
        selectedCount: result.selectedCount,
        sourceFetchedCount: result.sourceFetchedCount,
        duplicatesCount: result.duplicatesCount,
      },
    }).catch((error) => {
      console.warn("[run-generate-events-polymarket-v2] audit log failed:", error);
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      pipelineVersion: "polymarket-2.0",
      dryRun,
      ...result,
      created: result.createdCount,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Errore run-generate-events-polymarket-v2:", error);
    return NextResponse.json(
      {
        error: "Errore nella generazione eventi Polymarket 2.0",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
