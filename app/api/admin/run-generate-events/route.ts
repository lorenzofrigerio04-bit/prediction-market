import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { runPipeline } from "@/lib/event-generation";
import { FALLBACK_CANDIDATES, getFallbackVerificationConfig } from "@/lib/event-generation/fallback-candidates";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/run-generate-events
 * Esegue la pipeline di generazione eventi (fetch → verify → generate → create).
 * Solo admin. Utile per popolare il sito in produzione senza aspettare il cron.
 * Se il fetch notizie restituisce 0 candidati, riprova con candidati di esempio (date future).
 *
 * Body opzionale: { maxTotal?: number } (default 10)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    let maxTotal = 10;
    try {
      const body = await request.json().catch(() => ({}));
      if (typeof body.maxTotal === "number" && body.maxTotal >= 1 && body.maxTotal <= 20) {
        maxTotal = body.maxTotal;
      }
    } catch {
      // ignore, use default
    }

    const opts = {
      limit: 60,
      generation: {
        maxPerCategory: 5,
        maxTotal,
        maxRetries: 2,
      },
    };

    let result = await runPipeline(prisma, opts);
    let usedFallback = false;

    if (result.candidatesCount === 0 && result.createResult.created === 0) {
      result = await runPipeline(prisma, {
        ...opts,
        candidatesOverride: FALLBACK_CANDIDATES,
        verificationConfig: getFallbackVerificationConfig(),
      });
      usedFallback = true;
    }

    const { candidatesCount, verifiedCount, generatedCount, createResult } = result;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      usedFallback,
      candidatesCount,
      verifiedCount,
      generatedCount,
      created: createResult.created,
      skipped: createResult.skipped,
      errors: createResult.errors,
      eventIds: createResult.eventIds,
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
