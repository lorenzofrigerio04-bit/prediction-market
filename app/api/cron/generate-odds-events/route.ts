/**
 * Cron per generazione eventi da The Odds API.
 * Schedule: ogni 6 ore (allineato al refresh quote).
 *
 * Endpoint: GET|POST /api/cron/generate-odds-events
 * Autenticazione: CRON_SECRET
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runOddsEventPipeline } from "@/lib/odds-event-generation/run-pipeline";
import { generateEventImageForPost } from "@/lib/ai-image-generation/generate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSecretFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  const url = new URL(request.url);
  return url.searchParams.get("secret");
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

async function handleRequest(request: Request) {
  try {
    if (process.env.DISABLE_CRON_AUTOMATION === "true" || process.env.DISABLE_CRON_AUTOMATION === "1") {
      return NextResponse.json(
        { error: "Cron automation disabled", code: "CRON_DISABLED" },
        { status: 503 }
      );
    }
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.warn("[Cron generate-odds-events] CRON_SECRET not set");
      return NextResponse.json(
        { error: "CRON_SECRET not set" },
        { status: 500 }
      );
    }

    const providedSecret = getSecretFromRequest(request);
    if (!providedSecret || providedSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runOddsEventPipeline(prisma);

    // Genera immagini per i nuovi post (batch, max 10 per run per limitare costi)
    const toGenerate = result.postIdsForImages.slice(0, 10);
    let imagesOk = 0;
    for (const postId of toGenerate) {
      const imgResult = await generateEventImageForPost(postId);
      if (imgResult.ok) imagesOk++;
    }

    return NextResponse.json({
      ok: true,
      eventsFetched: result.eventsFetched,
      created: result.created,
      skipped: result.skipped,
      errors: result.errors.length,
      imagesGenerated: imagesOk,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Cron generate-odds-events]", message);
    return NextResponse.json(
      { error: "Pipeline failed", detail: message },
      { status: 500 }
    );
  }
}
