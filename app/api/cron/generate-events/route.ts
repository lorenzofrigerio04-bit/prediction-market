/**
 * Cron route protetta per generazione eventi (BLOCCO 5)
 *
 * Flusso (STEP 1): 1) Fetch fonti (processAllSources + invalidateTrendCache se INGESTION_ENABLED),
 *                  2) Pipeline eventi (runEventGenV2Pipeline).
 *
 * Endpoint: POST /api/cron/generate-events
 * Autenticazione: Bearer token via header o query param
 *
 * Env vars richieste:
 * - CRON_SECRET: segreto per autenticazione
 *
 * Env opzionali:
 * - INGESTION_ENABLED: se false, skip ingest (default true)
 * - GENERATE_EVENTS_REQUIRE_INGEST: se true, fallisce la run se l'ingest fallisce
 *
 * Usa sempre event-gen-v2 (trend → rulebook → marketId, sourceType=NEWS).
 * CANDIDATE_EVENT_GEN=true: usa TrendObjects da Trend Detection Engine invece di storylines
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runEventGenV2Pipeline } from '@/lib/event-gen-v2';
import { processAllSources, aggregateStats } from '@/lib/ingestion/processing/pipeline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSecretFromRequest(request: Request): string | null {
  // Prova header Authorization: Bearer <secret>
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Prova query param ?secret=
  const url = new URL(request.url);
  const secretParam = url.searchParams.get('secret');
  if (secretParam) {
    return secretParam;
  }

  return null;
}

function isIngestionEnabled(): boolean {
  const v = process.env.INGESTION_ENABLED;
  if (!v) return true;
  return v.trim().toLowerCase() === 'true' || v.trim() === '1';
}

const CRON_DISABLED_JSON = { error: 'Cron automation disabled', code: 'CRON_DISABLED' as const };
const CRON_DISABLED_STATUS = 503;

export async function POST(request: Request) {
  try {
    // Tutti i cron disabilitati: solo generazione manuale da dashboard admin
    if (process.env.DISABLE_CRON_AUTOMATION === 'true' || process.env.DISABLE_CRON_AUTOMATION === '1') {
      return NextResponse.json(CRON_DISABLED_JSON, { status: CRON_DISABLED_STATUS });
    }
    // Generazione eventi disabilitata (DISABLE_EVENT_GENERATION=true)
    if (process.env.DISABLE_EVENT_GENERATION === 'true') {
      return NextResponse.json({
        success: true,
        disabled: true,
        message: 'Event generation is disabled',
      });
    }

    // Verifica CRON_SECRET
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.warn('[Cron] CRON_SECRET not set');
      return NextResponse.json(
        { error: 'CRON_SECRET not set' },
        { status: 500 }
      );
    }

    // Verifica autenticazione
    const providedSecret = getSecretFromRequest(request);
    if (!providedSecret || providedSecret !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // STEP 1: Fetch fonti prima della pipeline (se INGESTION_ENABLED)
    let ingestRun: true | 'skipped' = 'skipped';
    let ingestDurationMs: number | undefined;
    let ingestError: string | undefined;
    let ingestTotals: { articlesFetched: number; articlesNew: number; clustersCreated: number } | undefined;

    if (isIngestionEnabled()) {
      const ingestStart = Date.now();
      try {
        const ingestResults = await processAllSources();
        const totals = aggregateStats(ingestResults);
        ingestRun = true;
        ingestDurationMs = Date.now() - ingestStart;
        ingestTotals = {
          articlesFetched: totals.articlesFetched,
          articlesNew: totals.articlesNew,
          clustersCreated: totals.clustersCreated,
        };
        try {
          const { invalidateTrendCache } = await import('@/lib/trend-detection');
          await invalidateTrendCache();
        } catch (e) {
          console.warn('[Cron generate-events] Could not invalidate trend cache:', e);
        }
      } catch (ingestErr) {
        const message = ingestErr instanceof Error ? ingestErr.message : String(ingestErr);
        console.error('[Cron generate-events] Ingest failed:', ingestErr);
        if (process.env.GENERATE_EVENTS_REQUIRE_INGEST === 'true') {
          return NextResponse.json(
            {
              error: 'Ingest required but failed',
              message,
              ingestRun: false,
            },
            { status: 500 }
          );
        }
        ingestError = message;
        // Continua con i dati già in DB
      }
    }

    // Esegui sempre event-gen-v2 (unico metodo di generazione)
    const result = await runEventGenV2Pipeline({
      prisma,
      now: new Date(),
      dryRun: false,
    });

    return NextResponse.json({
      success: true,
      eventGenV2: true,
      result,
      ingestRun,
      ...(ingestDurationMs !== undefined && { ingestDurationMs }),
      ...(ingestError !== undefined && { ingestError }),
      ...(ingestTotals !== undefined && { ingestTotals }),
    });
  } catch (error: any) {
    console.error('[Cron] Error generating events:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Supporta anche GET per semplicità (con query param)
export async function GET(request: Request) {
  return POST(request);
}
