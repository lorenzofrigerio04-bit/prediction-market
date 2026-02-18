import { NextRequest, NextResponse } from "next/server";
import { aggregateStats, processAllSources } from "@/lib/ingestion/processing/pipeline";

export const dynamic = "force-dynamic";

function isAuthorized(
  request: NextRequest
): { ok: true } | { ok: false; status: number; body: object } {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  const isProduction = process.env.VERCEL === "1";

  // In produzione CRON_SECRET è obbligatorio: l'endpoint non deve essere aperto
  if (isProduction && !cronSecret) {
    return {
      ok: false,
      status: 503,
      body: { error: "CRON_SECRET non configurato", ok: false },
    };
  }

  // In dev, se non c'è secret, lasciamo passare per facilitare test locali.
  if (!cronSecret) return { ok: true };

  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || token !== cronSecret) {
    return { ok: false, status: 401, body: { error: "Unauthorized", ok: false } };
  }

  return { ok: true };
}

function isIngestionEnabled(): boolean {
  const v = process.env.INGESTION_ENABLED;
  if (!v) return true;
  return v.trim().toLowerCase() === "true" || v.trim() === "1";
}

async function handleIngest(request: NextRequest) {
  const auth = isAuthorized(request);
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  if (!isIngestionEnabled()) {
    return NextResponse.json(
      {
        ok: true,
        skipped: true,
        reason: "INGESTION_ENABLED non è abilitato",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  const start = Date.now();
  try {
    const results = await processAllSources();
    const totals = aggregateStats(results);

    return NextResponse.json(
      {
        ok: true,
        timestamp: new Date().toISOString(),
        totals,
        results,
        durationMs: Date.now() - start,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[cron/ingest] error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - start,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/ingest
 * Endpoint per Vercel Cron (sends GET). Protetto da CRON_SECRET:
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  return handleIngest(request);
}

/**
 * POST /api/cron/ingest
 * Utile per trigger manuale (stessa protezione di GET).
 */
export async function POST(request: NextRequest) {
  return handleIngest(request);
}

