import { NextRequest, NextResponse } from "next/server";
import { generateEventImageForPost } from "@/lib/ai-image-generation/generate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/ai/generate-event-image
 * Body: { postId: string }
 * Genera l'immagine AI per il post e aggiorna Post.aiImageUrl.
 * Chiamata in background da POST /api/posts (e opzionalmente da cron/bot).
 */
export async function POST(request: NextRequest) {
  try {
    let body: { postId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Body JSON non valido" },
        { status: 400 }
      );
    }

    const postId =
      typeof body.postId === "string" ? body.postId.trim() : "";
    if (!postId) {
      return NextResponse.json(
        { success: false, error: "postId obbligatorio" },
        { status: 400 }
      );
    }

    const result = await generateEventImageForPost(postId);

    if (result.ok) {
      return NextResponse.json(
        { success: true, aiImageUrl: result.url },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/ai/generate-event-image]", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
