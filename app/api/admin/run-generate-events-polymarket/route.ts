import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { runReplicaPipeline } from "@/lib/event-replica";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

const MAX_TOTAL_MIN = 1;
const MAX_TOTAL_MAX = 500;

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
    const result = await runReplicaPipeline({
      prisma,
      now,
      dryRun: false,
      sourcePlatforms: ["polymarket"],
      ...(maxTotal != null && { maxTotal }),
    });

    const hint: string[] = [];
    if (!process.env.OPENAI_API_KEY?.trim()) {
      hint.push(
        "OPENAI_API_KEY non configurata: la pipeline usa traduzione AI per migliorare titoli/regole in italiano."
      );
    }

    await createAuditLog(prisma, {
      userId: admin.id,
      action: "PIPELINE_RUN_REPLICA_POLYMARKET",
      entityType: "pipeline",
      entityId: null,
      payload: {
        sourcePlatform: "polymarket",
        maxTotal: maxTotal ?? null,
        createdCount: result.createdCount,
        selectedCount: result.selectedCount,
        sourceFetchedCount: result.sourceFetchedCount,
        dedupedSourceCount: result.dedupedSourceCount,
      },
    }).catch((error) => {
      console.warn("[run-generate-events-polymarket] audit log failed:", error);
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      replicaPipeline: true,
      sourcePlatform: "polymarket",
      ...result,
      created: result.createdCount,
      ...(hint.length > 0 ? { hint: hint.join(" ") } : {}),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Errore run-generate-events-polymarket:", error);
    return NextResponse.json(
      {
        error: "Errore nella generazione eventi Polymarket",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
