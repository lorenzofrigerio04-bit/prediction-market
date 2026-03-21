import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { runEventGenV2Pipeline } from "@/lib/event-gen-v2";

export const dynamic = "force-dynamic";

/** Optional body: { maxTotal?: number } – cap events created in this run (e.g. 1–20). */
const MAX_TOTAL_MIN = 1;
const MAX_TOTAL_MAX = 50;

/**
 * POST /api/admin/run-generate-events
 * Genera eventi per la Home (notizie / discovery). Pipeline event-gen-v2.
 * Body opzionale: { maxTotal?: number } per limitare il numero di eventi creati in questa run.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminCapability("pipeline:run");

    if (process.env.DISABLE_EVENT_GENERATION === 'true') {
      return NextResponse.json(
        { error: 'Generazione eventi disabilitata (DISABLE_EVENT_GENERATION=true)' },
        { status: 403 }
      );
    }

    let maxTotal: number | undefined;
    try {
      const body = await request.json().catch(() => ({}));
      if (typeof body?.maxTotal === 'number' && Number.isInteger(body.maxTotal)) {
        if (body.maxTotal >= MAX_TOTAL_MIN && body.maxTotal <= MAX_TOTAL_MAX) {
          maxTotal = body.maxTotal;
        }
      }
    } catch {
      // ignore invalid body
    }

    const now = new Date();
    const result = await runEventGenV2Pipeline({
      prisma,
      now,
      dryRun: false,
      ...(maxTotal != null && { maxTotal }),
    });

    const hint =
      result.createdCount === 0 && process.env.USE_DISCOVERY_BACKED_PIPELINE !== "true"
        ? "Imposta USE_DISCOVERY_BACKED_PIPELINE=true in .env per usare le fonti discovery (ANSA, AGI, ISTAT, ecc.): gli eventi creati compariranno in Home e Esplora."
        : undefined;

    // Verifica read-after-write: gli eventi creati devono essere leggibili subito.
    const eventIds = result.eventIds ?? [];
    if (result.createdCount > 0 && eventIds.length > 0) {
      const found = await prisma.event.findMany({
        where: { id: { in: eventIds } },
        select: { id: true },
      });
      if (found.length < eventIds.length) {
        console.error(
          "[run-generate-events] Read-after-write: in DB solo",
          found.length,
          "di",
          eventIds.length,
          "eventi creati"
        );
      }
      // Breve attesa per ridurre replica lag prima che il client faccia refetch.
      await new Promise((r) => setTimeout(r, 1500));
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      eventGenV2: true,
      ...result,
      created: result.createdCount,
      ...(hint && { hint }),
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Non autenticato" || error.message.includes("Accesso negato"))) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Errore run-generate-events:", error);
    return NextResponse.json(
      {
        error: "Errore nella generazione eventi",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
