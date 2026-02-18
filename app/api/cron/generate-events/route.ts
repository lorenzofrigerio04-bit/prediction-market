/**
 * Cron route protetta per generazione eventi (BLOCCO 5)
 * 
 * Endpoint: POST /api/cron/generate-events
 * Autenticazione: Bearer token via header o query param
 * 
 * Env vars richieste:
 * - CRON_SECRET: segreto per autenticazione
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runPipelineV2 } from '@/lib/pipeline/runPipelineV2';

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

export async function POST(request: Request) {
  try {
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

    // Esegui pipeline
    const result = await runPipelineV2({
      prisma,
      now: new Date(),
      dryRun: false,
    });

    return NextResponse.json({
      success: true,
      result,
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
