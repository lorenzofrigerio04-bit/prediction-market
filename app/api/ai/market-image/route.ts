import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getAiImageGenerationConfig } from "@/lib/ai-image-generation/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/market-image?eventId=xxx
 * Serve l'immagine AI di un Event (market) dallo store Blob privato.
 * Used for Event Gen v2.0 market background images.
 */
export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId?.trim()) {
    return NextResponse.json({ error: "eventId obbligatorio" }, { status: 400 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId.trim() },
      select: { id: true, imageGenerationStatus: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Event non trovato" }, { status: 404 });
    }
    if (event.imageGenerationStatus !== "SUCCESS") {
      return NextResponse.json(
        { error: "Immagine non ancora generata" },
        { status: 404 }
      );
    }

    const config = getAiImageGenerationConfig();
    const pathname = `ai-images/markets/${eventId.trim()}.png`;
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
    console.error("[api/ai/market-image]", err);
    return NextResponse.json(
      { error: "Errore nel caricamento dell'immagine" },
      { status: 500 }
    );
  }
}
