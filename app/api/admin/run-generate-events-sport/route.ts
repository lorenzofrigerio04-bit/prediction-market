import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { runSportPipeline } from "@/lib/event-gen-v2/sport-pipeline";

export const dynamic = "force-dynamic";

/** Piano free football-data.org: 10 richieste/minuto; 1 richiesta per run → max eventi per run in linea con limite. */
const MAX_TOTAL_MIN = 1;
const MAX_TOTAL_MAX = 200;

/** Ultima esecuzione (timestamp ms) per rate-limit UI (10 req/min). */
let lastSportRunAt = 0;
const RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * GET /api/admin/run-generate-events-sport
 * Stato generazione sport: se si può generare o attendere (limite API 10 req/min).
 */
export async function GET() {
  try {
    await requireAdminCapability("pipeline:run");
    const now = Date.now();
    const elapsed = now - lastSportRunAt;
    const canGenerate = elapsed >= RATE_LIMIT_WINDOW_MS || lastSportRunAt === 0;
    const retryAfterSeconds = canGenerate ? 0 : Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000);
    return NextResponse.json({
      canGenerate,
      retryAfterSeconds,
      rateLimitWindowSeconds: RATE_LIMIT_WINDOW_MS / 1000,
    });
  } catch (e) {
    if (e instanceof Error && (e.message === "Non autenticato" || e.message.includes("Accesso negato"))) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }
}

/**
 * POST /api/admin/run-generate-events-sport
 * Genera eventi solo per la pagina Sport (fixture calcio da football-data.org, category Calcio, sourceType SPORT).
 * Competizioni: Serie A (SA), Champions League (CL), Premier League (PL), La Liga (PD).
 * Body opzionale: { maxTotal?: number } – cap eventi creati (default 50, max 200).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminCapability("pipeline:run");

    if (process.env.DISABLE_EVENT_GENERATION === "true") {
      return NextResponse.json(
        { error: "Generazione eventi disabilitata (DISABLE_EVENT_GENERATION=true)" },
        { status: 403 }
      );
    }

    const nowMs = Date.now();
    if (nowMs - lastSportRunAt < RATE_LIMIT_WINDOW_MS && lastSportRunAt !== 0) {
      const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (nowMs - lastSportRunAt)) / 1000);
      return NextResponse.json(
        { error: `Attendere ${retryAfter} s (limite API 10 req/min)`, retryAfterSeconds: retryAfter },
        { status: 429 }
      );
    }

    let maxTotal = 50;
    try {
      const body = await request.json().catch(() => ({}));
      if (typeof body?.maxTotal === "number" && Number.isInteger(body.maxTotal)) {
        if (body.maxTotal >= MAX_TOTAL_MIN && body.maxTotal <= MAX_TOTAL_MAX) {
          maxTotal = body.maxTotal;
        }
      }
    } catch {
      // ignore
    }

    lastSportRunAt = Date.now();
    const now = new Date();
    const result = await runSportPipeline({
      prisma,
      now,
      dryRun: false,
      maxTotal,
    });

    const allDuplicates =
      result.createdCount === 0 &&
      result.fixturesCount > 0 &&
      (result.reasonsCount?.DUPLICATE_IN_DB ?? 0) === result.candidatesCount;
    const hint =
      result.createdCount === 0 && result.fixturesCount === 0
        ? "Nessuna fixture ricevuta da football-data.org. Verifica FOOTBALL_DATA_ORG_API_TOKEN e che ci siano partite in calendario (Serie A, Champions League, ecc.) nei prossimi 7 giorni."
        : result.createdCount === 0 && result.fixturesCount > 0
          ? allDuplicates
            ? "Tutte le partite sono già presenti in DB. Nuove partite verranno create quando ci saranno match in date non ancora importate."
            : "Fixture ricevute ma 0 eventi creati. Vedi diagnostica sotto (rulebook/dedup/publish)."
          : undefined;

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      sportPipeline: true,
      ...result,
      created: result.createdCount,
      ...(hint && { hint }),
      // Diagnostica quando fixture > 0 ma creati = 0
      ...(result.createdCount === 0 &&
        result.fixturesCount > 0 && {
          diagnostic: {
            fixturesCount: result.fixturesCount,
            candidatesCount: result.candidatesCount,
            rulebookValid: result.rulebookValidCount,
            rulebookRejected: result.rulebookRejectedCount,
            afterDedup: result.dedupedCandidatesCount,
            selected: result.selectedCount,
            skippedAtPublish: result.skippedCount,
            rejectionReasons: result.reasonsCount,
          },
        }),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Errore run-generate-events-sport:", error);
    return NextResponse.json(
      {
        error: "Errore nella generazione eventi sport",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
