import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEventImageForPost } from "@/lib/ai-image-generation/generate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_POSTS_PER_RUN = 5;

/**
 * Cron: processa post con type AI_IMAGE e aiImageUrl null, generando le immagini.
 * Richiede: GET o POST + header Authorization: Bearer <CRON_SECRET>.
 * Idempotente: generateEventImageForPost salta se il post ha già aiImageUrl.
 */
async function handleGeneratePostImages(request: NextRequest) {
  try {
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

    const pending = await prisma.post.findMany({
      where: {
        type: "AI_IMAGE",
        aiImageUrl: null,
        hidden: false,
      },
      orderBy: { createdAt: "asc" },
      take: MAX_POSTS_PER_RUN,
      select: { id: true },
    });

    let generated = 0;
    const errors: { postId: string; error: string }[] = [];

    for (const { id: postId } of pending) {
      const result = await generateEventImageForPost(postId);
      if (result.ok) generated++;
      else errors.push({ postId, error: result.error });
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
    console.error("[cron/generate-post-images]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to run generate-post-images",
        details: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGeneratePostImages(request);
}

export async function POST(request: NextRequest) {
  return handleGeneratePostImages(request);
}
