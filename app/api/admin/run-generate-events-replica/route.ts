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
      ...(maxTotal != null && { maxTotal }),
    });

    const hint: string[] = [];
    if (!process.env.OPENAI_API_KEY?.trim()) {
      hint.push("OPENAI_API_KEY non configurata: la pipeline replica richiede traduzione AI per output in italiano di qualita.");
    }
    const hasRsa =
      !!process.env.KALSHI_ACCESS_KEY_ID?.trim() &&
      (!!process.env.KALSHI_PRIVATE_KEY?.trim() || !!process.env.KALSHI_PRIVATE_KEY_PATH?.trim());
    if (!hasRsa && !process.env.KALSHI_API_KEY?.trim()) {
      hint.push(
        "Credenziali Kalshi mancanti: imposta KALSHI_ACCESS_KEY_ID + KALSHI_PRIVATE_KEY (o KALSHI_PRIVATE_KEY_PATH). Kalshi usa firma RSA, non solo Bearer."
      );
    }
    if (process.env.REPLICA_ENABLE_KALSHI === "false") {
      hint.push("REPLICA_ENABLE_KALSHI=false: abilita REPLICA_ENABLE_KALSHI=true per la replica Kalshi-first.");
    }

    await createAuditLog(prisma, {
      userId: admin.id,
      action: "PIPELINE_RUN_REPLICA",
      entityType: "pipeline",
      entityId: null,
      payload: {
        maxTotal: maxTotal ?? null,
        createdCount: result.createdCount,
        selectedCount: result.selectedCount,
        sourceFetchedCount: result.sourceFetchedCount,
        dedupedSourceCount: result.dedupedSourceCount,
      },
    }).catch((error) => {
      console.warn("[run-generate-events-replica] audit log failed:", error);
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      replicaPipeline: true,
      ...result,
      created: result.createdCount,
      ...(hint.length > 0 ? { hint: hint.join(" ") } : {}),
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Non autenticato" || error.message.includes("Accesso negato"))) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Errore run-generate-events-replica:", error);
    return NextResponse.json(
      {
        error: "Errore nella generazione eventi replica",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
