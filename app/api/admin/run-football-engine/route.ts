import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { runFootballEngine } from "@/lib/football-engine";
import { validateCandidates } from "@/lib/event-gen-v2/rulebook-validator";
import { scoreCandidates } from "@/lib/event-publishing/scoring";
import { dedupCandidates, publishSelectedV2 } from "@/lib/event-gen-v2/publisher";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

let lastRunAt = 0;
const RATE_LIMIT_MS = 120_000;

/**
 * POST /api/admin/run-football-engine
 *
 * Runs the full Football Intelligence Engine pipeline:
 * RADAR → BRAIN → FORGE → validate → score → dedup → publish
 *
 * Body: { dryRun?: boolean, maxTier?: number, maxMatches?: number }
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
    if (nowMs - lastRunAt < RATE_LIMIT_MS && lastRunAt !== 0) {
      const retryAfter = Math.ceil((RATE_LIMIT_MS - (nowMs - lastRunAt)) / 1000);
      return NextResponse.json(
        { error: `Pipeline in cooldown. Riprova tra ${retryAfter}s.`, retryAfterSeconds: retryAfter },
        { status: 429 }
      );
    }

    let dryRun = false;
    let maxTier = 2;
    let maxMatches = 15;

    try {
      const body = await request.json().catch(() => ({}));
      if (typeof body?.dryRun === "boolean") dryRun = body.dryRun;
      if (typeof body?.maxTier === "number") maxTier = Math.min(4, Math.max(1, body.maxTier));
      if (typeof body?.maxMatches === "number") maxMatches = Math.min(30, Math.max(1, body.maxMatches));
    } catch {
      // ignore
    }

    lastRunAt = Date.now();

    // ── Run the Football Intelligence Engine ──────────────────
    const engineResult = await runFootballEngine({
      radar: { maxTier, fetchOddsEnabled: true, fetchH2HEnabled: true },
      brain: { maxMatches, minInterestScore: 15 },
      dryRun,
    });

    if (engineResult.candidates.length === 0) {
      return NextResponse.json({
        success: true,
        dryRun,
        created: 0,
        hint: "Il Football Intelligence Engine non ha prodotto candidati. Possibili cause: nessuna partita interessante nel periodo, tutti gli eventi già esistenti, o BRAIN non ha approvato nessuna idea.",
        diagnostics: engineResult.diagnostics,
      });
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        candidates: engineResult.candidates.map((c) => ({
          title: c.title,
          category: c.category,
          marketType: c.marketType ?? "BINARY",
          closesAt: c.closesAt,
          templateId: c.templateId,
          momentum: c.momentum,
          novelty: c.novelty,
          creationMetadata: c.creationMetadata,
        })),
        diagnostics: engineResult.diagnostics,
      });
    }

    // ── Standard pipeline: validate → score → dedup → publish ─
    const validationResult = validateCandidates(engineResult.candidates);
    const validCandidates = validationResult.valid;

    const storylineStatsMap = new Map<string, { momentum: number; novelty: number }>();
    for (const c of validCandidates) {
      storylineStatsMap.set(c.sourceStorylineId, {
        momentum: c.momentum ?? 70,
        novelty: c.novelty ?? 60,
      });
    }
    const scored = scoreCandidates(validCandidates, storylineStatsMap);

    const { deduped } = await dedupCandidates(prisma, scored);

    let createdCount = 0;
    let eventIds: string[] = [];

    if (deduped.length > 0) {
      const publishResult = await publishSelectedV2(prisma, deduped, new Date(), {
        sourceType: "SPORT",
      });
      createdCount = publishResult.createdCount;
      eventIds = publishResult.eventIds ?? [];
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      created: createdCount,
      eventIds,
      pipeline: {
        engineCandidates: engineResult.candidates.length,
        rulebookValid: validCandidates.length,
        rulebookRejected: validationResult.rejected.length,
        afterScoring: scored.length,
        afterDedup: deduped.length,
        published: createdCount,
      },
      diagnostics: engineResult.diagnostics,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Errore run-football-engine:", error);
    return NextResponse.json(
      {
        error: "Errore nella pipeline Football Intelligence Engine",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
