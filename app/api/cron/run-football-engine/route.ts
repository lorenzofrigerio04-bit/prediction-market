/**
 * Cron route — Football Intelligence Engine (FIE)
 *
 * Esegue automaticamente la pipeline FIE ogni 8 ore:
 *   RADAR → BRAIN → FORGE → validate → score → dedup → publish
 *
 * Schedule: every 8 hours at minute 0 (00:00, 08:00, 16:00 UTC)
 * Endpoint: POST /api/cron/run-football-engine
 *
 * Auth: Bearer token via header Authorization o query param ?secret=
 *
 * Env vars richieste:
 *   CRON_SECRET                — segreto condiviso con Vercel Cron
 *   API_FOOTBALL_KEY           — chiave API-Football (fixtures, injuries, H2H, standings)
 *   OPENAI_API_KEY o ANTHROPIC_API_KEY — almeno una chiave LLM per gli agenti BRAIN
 *
 * Env vars opzionali:
 *   DISABLE_CRON_AUTOMATION    — se "true", disabilita tutti i cron (inclusa FIE)
 *   FIE_CRON_MAX_MATCHES       — override maxMatches (default: 12)
 *   FIE_CRON_MAX_TIER          — override maxTier (default: 2)
 *   FIE_CRON_MIN_INTEREST      — override minInterestScore (default: 5)
 *
 * NOTE: DISABLE_EVENT_GENERATION non influenza questo cron — la FIE è la pipeline
 * sport dedicata e rimane attiva in FIE-ONLY mode.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { runFootballEngine } from "@/lib/football-engine";
import { validateCandidates } from "@/lib/event-gen-v2/rulebook-validator";
import { scoreCandidates } from "@/lib/event-publishing/scoring";
import { dedupCandidates, publishSelectedV2 } from "@/lib/event-gen-v2/publisher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Allow up to 5 min — the pipeline takes ~90s with parallel LLM calls
export const maxDuration = 300;

function getSecret(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const url = new URL(request.url);
  return url.searchParams.get("secret");
}

function intEnv(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}

export async function POST(request: Request) {
  const startTime = Date.now();

  // ── Guard: cron automation disabled ─────────────────────────
  if (
    process.env.DISABLE_CRON_AUTOMATION === "true" ||
    process.env.DISABLE_CRON_AUTOMATION === "1"
  ) {
    return NextResponse.json(
      { error: "Cron automation disabled", code: "CRON_DISABLED" },
      { status: 503 }
    );
  }

  // NOTE: DISABLE_EVENT_GENERATION non blocca la FIE — questa è la pipeline sport
  // dedicata, sempre attiva in FIE-ONLY mode (vedi commento in .env.example).

  // ── Auth ─────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[FIE Cron] CRON_SECRET not configured");
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }

  const provided = getSecret(request);
  if (!provided || provided !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Validate required env vars ───────────────────────────────
  const missingVars: string[] = [];
  if (!process.env.API_FOOTBALL_KEY?.trim()) missingVars.push("API_FOOTBALL_KEY");
  if (!process.env.OPENAI_API_KEY?.trim() && !process.env.ANTHROPIC_API_KEY?.trim()) {
    missingVars.push("OPENAI_API_KEY o ANTHROPIC_API_KEY (almeno una)");
  }
  if (missingVars.length > 0) {
    console.error(`[FIE Cron] Env vars mancanti: ${missingVars.join(", ")}`);
    return NextResponse.json(
      { error: "Env vars richieste mancanti", missing: missingVars },
      { status: 500 }
    );
  }

  // ── Pipeline config ──────────────────────────────────────────
  const maxMatches = intEnv("FIE_CRON_MAX_MATCHES", 12);
  const maxTier = intEnv("FIE_CRON_MAX_TIER", 2);
  const minInterestScore = intEnv("FIE_CRON_MIN_INTEREST", 5);

  console.log(
    `[FIE Cron] Starting run — maxMatches:${maxMatches} maxTier:${maxTier} minInterest:${minInterestScore}`
  );

  // ── Step 1: Football Intelligence Engine ────────────────────
  let engineResult;
  let diagnostics;
  const pipelineErrors: string[] = [];

  try {
    engineResult = await runFootballEngine({
      radar: { maxTier, fetchOddsEnabled: true, fetchH2HEnabled: true, fetchNewsEnabled: true },
      brain: { maxMatches, minInterestScore, skipResolver: true },
      dryRun: false,
    });
    diagnostics = engineResult.diagnostics;

    console.log(
      `[FIE Cron] FORGE → ${engineResult.candidates.length} candidates (RADAR:${diagnostics.radarMatchCount} matches, Creative:${diagnostics.brainIdeaCount} ideas, Approved:${diagnostics.brainApprovedCount})`
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[FIE Cron] Engine pipeline failed:", error);
    pipelineErrors.push(`ENGINE: ${errorMsg}`);

    await safeAuditLog("FIE_CRON_RUN", {
      timestamp: new Date().toISOString(),
      durationMs,
      step: "ENGINE",
      error: errorMsg,
      candidatesProduced: 0,
      eventsCreated: 0,
    });

    return NextResponse.json(
      {
        error: "FIE engine pipeline failed",
        details: errorMsg,
        durationMs,
      },
      { status: 500 }
    );
  }

  const { candidates } = engineResult;

  if (candidates.length === 0) {
    const durationMs = Date.now() - startTime;

    // Build a human-readable hint to aid debugging
    const d = diagnostics;
    const hint =
      d.radarMatchCount === 0
        ? "RADAR ha trovato 0 partite. Verifica API_FOOTBALL_KEY e che ci siano partite nei prossimi 14 giorni."
        : d.brainMatchesAnalyzed === 0
          ? `BRAIN ha ricevuto 0 partite (interest score troppo alto? minInterest=${minInterestScore}). RADAR aveva ${d.radarMatchCount} partite.`
          : d.brainIdeaCount === 0
            ? `Creative ha generato 0 idee su ${d.brainMatchesAnalyzed} partite. Controlla OPENAI_API_KEY/ANTHROPIC_API_KEY.`
            : d.brainApprovedCount === 0
              ? `Verifier ha rifiutato tutte le ${d.brainIdeaCount} idee. Modello troppo conservativo.`
              : `FORGE ha prodotto 0 candidati da ${d.brainApprovedCount} eventi approvati.`;

    console.warn(`[FIE Cron] 0 candidati — ${hint}`);

    await safeAuditLog("FIE_CRON_RUN", {
      timestamp: new Date().toISOString(),
      durationMs,
      candidatesProduced: 0,
      eventsCreated: 0,
      hint,
      diagnostics,
    });

    return NextResponse.json({
      success: true,
      created: 0,
      message: "FIE produced 0 candidates — nothing to publish",
      hint,
      diagnostics,
      durationMs,
    });
  }

  // ── Step 2: Validate → Score → Dedup → Publish ─────────────
  let createdCount = 0;
  let eventIds: string[] = [];
  let validCount = 0;
  let rejectedCount = 0;
  let rejectionReasons: Record<string, number> = {};
  let scoredCount = 0;
  let dedupedCount = 0;

  try {
    const validationResult = validateCandidates(candidates);
    const validCandidates = validationResult.valid;
    validCount = validCandidates.length;
    rejectedCount = validationResult.rejected.length;
    rejectionReasons = validationResult.rejectionReasons;

    console.log(
      `[FIE Cron] Rulebook: ${validCount} valid, ${rejectedCount} rejected`
    );

    if (validCandidates.length > 0) {
      const storylineStatsMap = new Map<string, { momentum: number; novelty: number }>();
      for (const c of validCandidates) {
        storylineStatsMap.set(c.sourceStorylineId, {
          momentum: c.momentum ?? 70,
          novelty: c.novelty ?? 60,
        });
      }
      const scored = scoreCandidates(validCandidates, storylineStatsMap);
      scoredCount = scored.length;
      const { deduped } = await dedupCandidates(prisma, scored);
      dedupedCount = deduped.length;

      if (deduped.length > 0) {
        const publishResult = await publishSelectedV2(prisma, deduped, new Date(), {
          sourceType: "SPORT",
        });
        createdCount = publishResult.createdCount;
        eventIds = publishResult.eventIds ?? [];
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[FIE Cron] Publish pipeline failed:", error);
    pipelineErrors.push(`PUBLISH: ${errorMsg}`);
  }

  const durationMs = Date.now() - startTime;

  console.log(
    `[FIE Cron] Done in ${(durationMs / 1000).toFixed(1)}s — published ${createdCount} events (${dedupedCount} after dedup)${pipelineErrors.length > 0 ? ` [${pipelineErrors.length} errors]` : ""}`
  );

  await safeAuditLog("FIE_CRON_RUN", {
    timestamp: new Date().toISOString(),
    durationMs,
    candidatesProduced: candidates.length,
    rulebookValid: validCount,
    rulebookRejected: rejectedCount,
    afterScoring: scoredCount,
    afterDedup: dedupedCount,
    eventsCreated: createdCount,
    errors: pipelineErrors.length > 0 ? pipelineErrors : undefined,
    diagnostics,
  });

  return NextResponse.json({
    success: pipelineErrors.length === 0,
    created: createdCount,
    eventIds,
    pipeline: {
      engineCandidates: candidates.length,
      rulebookValid: validCount,
      rulebookRejected: rejectedCount,
      rejectionReasons,
      afterScoring: scoredCount,
      afterDedup: dedupedCount,
      published: createdCount,
    },
    errors: pipelineErrors.length > 0 ? pipelineErrors : undefined,
    diagnostics,
    durationMs,
  });
}

// Support GET as well (Vercel sends GET by default for cron jobs)
export async function GET(request: Request) {
  return POST(request);
}

async function safeAuditLog(
  action: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await createAuditLog(prisma, {
      userId: null,
      action,
      entityType: "CRON",
      entityId: null,
      payload,
    });
  } catch (err) {
    console.warn(
      "[FIE Cron] AuditLog write failed:",
      err instanceof Error ? err.message : err
    );
  }
}
