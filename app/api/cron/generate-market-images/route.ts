import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMarketImageForEvent } from "@/lib/ai-image-generation/generate-market-image";

export const dynamic = "force-dynamic";
/** Più slot per smaltire la coda quando molti eventi sono senza copertina (es. dopo deploy). */
export const maxDuration = 300;

const MAX_EVENTS_PER_RUN = 12;

/** Lock IN_PROGRESS lasciati da istanze serverless interrotte: tornano PENDING. */
const STALE_IN_PROGRESS_MS = 12 * 60 * 1000;

/**
 * Cron: eventi visibili senza `imageUrl` (o con generazione in errore / stuck).
 * Prima causa reale degli eventi senza copertina in prod:
 * - `enqueueMarketImageGeneration` girava in fire-and-forget: la funzione si chiudeva prima del completamento.
 * - Stato IN_PROGRESS bloccante: questo cron non selezionava mai IN_PROGRESS, quindi eventi congelati per sempre.
 * - Filtro `generatorVersion === 2.0` escludeva eventi più vecchi o senza quel campo.
 *
 * Richiede: GET o POST + header Authorization: Bearer <CRON_SECRET>.
 */
const CRON_DISABLED_JSON = { error: "Cron automation disabled", code: "CRON_DISABLED" as const };

async function handleGenerateMarketImages(request: NextRequest) {
  try {
    if (process.env.DISABLE_CRON_AUTOMATION === "true" || process.env.DISABLE_CRON_AUTOMATION === "1") {
      return NextResponse.json(CRON_DISABLED_JSON, { status: 503 });
    }
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET?.trim();
    const isProduction = process.env.VERCEL === "1";

    if (isProduction && !cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET non configurato" },
        { status: 503 }
      );
    }
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const staleBefore = new Date(Date.now() - STALE_IN_PROGRESS_MS);
    const resetStaleLocks = await prisma.event.updateMany({
      where: {
        imageGenerationStatus: "IN_PROGRESS",
        updatedAt: { lt: staleBefore },
      },
      data: { imageGenerationStatus: "PENDING" },
    });

    const fixInconsistentSuccess = await prisma.event.updateMany({
      where: {
        imageGenerationStatus: "SUCCESS",
        OR: [{ imageUrl: null }, { imageUrl: "" }],
      },
      data: { imageGenerationStatus: "PENDING" },
    });

    const pending = await prisma.event.findMany({
      where: {
        hidden: false,
        AND: [
          { OR: [{ imageUrl: null }, { imageUrl: "" }] },
          {
            OR: [
              { imageGenerationStatus: { in: ["PENDING", "FAILED"] } },
              {
                imageGenerationStatus: "IN_PROGRESS",
                updatedAt: { lt: staleBefore },
              },
            ],
          },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: MAX_EVENTS_PER_RUN,
      select: { id: true },
    });

    let generated = 0;
    const errors: { eventId: string; error: string }[] = [];

    for (const { id: eventId } of pending) {
      const result = await generateMarketImageForEvent(eventId);
      if (result.ok) generated++;
      else errors.push({ eventId, error: result.error });
    }

    return NextResponse.json(
      {
        ok: true,
        staleLocksReset: resetStaleLocks.count,
        inconsistentSuccessReset: fixInconsistentSuccess.count,
        processed: pending.length,
        generated,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/generate-market-images]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to run generate-market-images",
        details: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGenerateMarketImages(request);
}

export async function POST(request: NextRequest) {
  return handleGenerateMarketImages(request);
}
