import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMarketImageForEvent } from "@/lib/ai-image-generation/generate-market-image";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_EVENTS_PER_RUN = 5;

/**
 * Cron: processa Event con imageGenerationStatus PENDING o FAILED (Event Gen v2.0).
 * Genera immagini AI per market e aggiorna Event.imageUrl e metadata.
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

    const pending = await prisma.event.findMany({
      where: {
        imageGenerationStatus: { in: ["PENDING", "FAILED"] },
        generatorVersion: "2.0",
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
