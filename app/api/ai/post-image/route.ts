import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getAiImageGenerationConfig } from "@/lib/ai-image-generation/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/post-image?postId=xxx
 * Serve l'immagine AI di un post dallo store Blob privato.
 * Usato quando lo store è configurato con accesso private.
 */
export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId?.trim()) {
    return NextResponse.json({ error: "postId obbligatorio" }, { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId.trim() },
      select: { id: true, type: true },
    });
    if (!post || post.type !== "AI_IMAGE") {
      return NextResponse.json({ error: "Post non trovato" }, { status: 404 });
    }

    const config = getAiImageGenerationConfig();
    const pathname = `ai-images/${postId.trim()}.png`;
    const result = await get(pathname, {
      access: "private",
      token: config.blobToken,
    });

    if (!result) {
      return NextResponse.json({ error: "Immagine non trovata" }, { status: 404 });
    }
    if (result.statusCode === 304) {
      return new NextResponse(null, { status: 304 });
    }

    const contentType = result.blob.contentType ?? "image/png";
    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[api/ai/post-image]", err);
    return NextResponse.json(
      { error: "Errore nel caricamento dell'immagine" },
      { status: 500 }
    );
  }
}
