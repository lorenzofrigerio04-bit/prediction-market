import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createEventsFromGenerated,
  runPipeline,
} from "@/lib/event-generation";
import type { GeneratedEvent } from "@/lib/event-generation";

export const dynamic = "force-dynamic";

/** Verifica Authorization: Bearer con CRON_SECRET o EVENT_GENERATOR_SECRET. */
function isAuthorized(request: NextRequest): { ok: true } | { ok: false; status: number; body: object } {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  const eventGeneratorSecret = process.env.EVENT_GENERATOR_SECRET?.trim();
  const isProduction = process.env.VERCEL === "1";

  const hasAnySecret = !!(cronSecret || eventGeneratorSecret);
  if (isProduction && !hasAnySecret) {
    return {
      ok: false,
      status: 503,
      body: { error: "CRON_SECRET o EVENT_GENERATOR_SECRET non configurato" },
    };
  }
  if (!hasAnySecret) {
    return { ok: true }; // sviluppo senza segreti: permetti
  }
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const valid = token && (token === cronSecret || token === eventGeneratorSecret);
  if (!valid) {
    return { ok: false, status: 401, body: { error: "Unauthorized" } };
  }
  return { ok: true };
}

/** Obiettivo: numero di eventi aperti (closesAt nel futuro, non risolti) da mantenere. Default 20. */
const DEFAULT_TARGET_OPEN_EVENTS = 20;
/** Massimo eventi da generare in una singola run (evita run troppo lunghe). */
const DEFAULT_MAX_PER_RUN = 15;

/**
 * GET /api/cron/generate-events
 * Mantiene sempre almeno TARGET_OPEN_EVENTS eventi aperti: conta gli eventi aperti, se sotto soglia
 * esegue la pipeline per generarne di nuovi (fino a maxPerRun per run).
 * Protetto da CRON_SECRET o EVENT_GENERATOR_SECRET (Authorization: Bearer <secret>).
 * Query: limit, maxPerCategory, maxTotal (opzionali; se non passati si usano target e maxPerRun).
 * Risposta: metriche (openCount, target, needToGenerate, candidatesCount, created, eventIds, ...).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json(auth.body, { status: auth.status });
    }

    const now = new Date();
    const targetOpenEvents =
      parseInt(process.env.TARGET_OPEN_EVENTS ?? "", 10) || DEFAULT_TARGET_OPEN_EVENTS;
    const maxPerRun =
      parseInt(process.env.GENERATE_EVENTS_MAX_PER_RUN ?? "", 10) || DEFAULT_MAX_PER_RUN;

    const openCount = await prisma.event.count({
      where: {
        resolved: false,
        closesAt: { gt: now },
      },
    });

    const needToGenerate = Math.max(0, Math.min(targetOpenEvents - openCount, maxPerRun));

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const maxTotalParam = searchParams.get("maxTotal");

    const limit = Math.min(
      100,
      Math.max(1, parseInt(limitParam ?? "80", 10) || 80)
    );
    const maxPerCategory = Math.min(
      15,
      Math.max(1, parseInt(searchParams.get("maxPerCategory") ?? "8", 10) || 8)
    );
    const maxTotal =
      maxTotalParam !== null && maxTotalParam !== ""
        ? Math.min(80, Math.max(1, parseInt(maxTotalParam, 10) || needToGenerate))
        : needToGenerate;

    if (needToGenerate <= 0) {
      return NextResponse.json({
        success: true,
        timestamp: now.toISOString(),
        openCount,
        target: targetOpenEvents,
        needToGenerate: 0,
        candidatesCount: 0,
        verifiedCount: 0,
        generatedCount: 0,
        created: 0,
        skipped: 0,
        errors: [],
        eventIds: [],
      });
    }

    const result = await runPipeline(prisma, {
      limit,
      generation: {
        maxPerCategory,
        maxTotal,
        maxRetries: 2,
      },
    });

    const { candidatesCount, verifiedCount, generatedCount, createResult } = result;

    console.log("[cron/generate-events]", {
      openCount,
      target: targetOpenEvents,
      needToGenerate,
      candidates: candidatesCount,
      verified: verifiedCount,
      generated: generatedCount,
      created: createResult.created,
      skipped: createResult.skipped,
      errors: createResult.errors.length,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      openCount,
      target: targetOpenEvents,
      needToGenerate,
      candidatesCount,
      verifiedCount,
      generatedCount,
      created: createResult.created,
      skipped: createResult.skipped,
      errors: createResult.errors,
      eventIds: createResult.eventIds,
    });
  } catch (error) {
    console.error("Errore in GET /api/cron/generate-events:", error);
    return NextResponse.json(
      {
        error: "Errore nella pipeline generazione eventi",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/generate-events
 * Crea in DB gli eventi generati (body: { events: GeneratedEvent[] }).
 * Protetto da CRON_SECRET o EVENT_GENERATOR_SECRET.
 * Risposta: { created, skipped, errors, eventIds }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json(auth.body, { status: auth.status });
    }

    const body = await request.json();
    const rawEvents = Array.isArray(body.events) ? body.events : body;
    if (!Array.isArray(rawEvents)) {
      return NextResponse.json(
        { error: "Body deve contenere un array 'events' di eventi generati" },
        { status: 400 }
      );
    }

    const events = rawEvents as GeneratedEvent[];
    const result = await createEventsFromGenerated(prisma, events);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Errore in POST /api/cron/generate-events:", error);
    return NextResponse.json(
      {
        error: "Errore nella creazione eventi",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
