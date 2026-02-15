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

/**
 * GET /api/cron/generate-events
 * Esegue la pipeline end-to-end: fetch trending → verify → generate (LLM) → create in DB.
 * Protetto da CRON_SECRET o EVENT_GENERATOR_SECRET (Authorization: Bearer <secret>).
 * Query: limit (optional), maxPerCategory (optional), maxTotal (optional).
 * Risposta: metriche (candidatesCount, verifiedCount, generatedCount, created, skipped, errors, eventIds).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json(auth.body, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "80", 10) || 80));
    const maxPerCategory = Math.min(15, Math.max(1, parseInt(searchParams.get("maxPerCategory") ?? "8", 10) || 8));
    const maxTotal = Math.min(80, Math.max(1, parseInt(searchParams.get("maxTotal") ?? "40", 10) || 40));

    const result = await runPipeline(prisma, {
      limit,
      generation: { maxPerCategory, maxTotal, maxRetries: 2 },
    });

    const { candidatesCount, verifiedCount, generatedCount, createResult } = result;

    // Log metriche per monitoraggio (opzionale)
    console.log("[cron/generate-events]", {
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
