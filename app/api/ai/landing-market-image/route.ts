import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { get, put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getAiImageGenerationConfig } from "@/lib/ai-image-generation/config";
import { isAiImageGenerationDisabled } from "@/lib/check-ai-image-disabled";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const BILLING_COOLDOWN_MS = 15 * 60 * 1000;
let generationBlockedUntil = 0;

function getImageSizeForModel(model: string): "1024x1024" | "1792x1024" {
  if (model === "dall-e-3") return "1792x1024";
  return "1024x1024";
}

function buildLandingTop10Prompt(title: string, category: string): string {
  return [
    "Create a cinematic prediction-market background image.",
    "Topic:",
    `"${title}"`,
    `Category: ${category}.`,
    "Strict composition:",
    "- Keep the LEFT 55% dark, clean, and readable for text overlay.",
    "- Put the main subject on the RIGHT side, near full card height.",
    "- Subject must be realistic and strongly related to the topic.",
    "- Add dramatic lighting and high contrast.",
    "- Do not place logos, watermarks, flags with text, or UI widgets.",
    "- Do not render any text or numbers in the image.",
    "Style: modern, premium, newsroom-cinematic, high detail.",
  ].join("\n");
}

function imageResponseFromBuffer(buffer: Buffer): NextResponse {
  const bytes = new Uint8Array(buffer);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId")?.trim();
  if (!eventId) {
    return NextResponse.json({ error: "eventId obbligatorio" }, { status: 400 });
  }

  let config;
  try {
    config = getAiImageGenerationConfig();
  } catch {
    return NextResponse.json({ error: "Config immagini AI non disponibile" }, { status: 503 });
  }

  const blobPath = `ai-images/landing-top10/${eventId}.png`;

  try {
    const existing = await get(blobPath, {
      access: "private",
      token: config.blobToken,
    });
    if (existing && existing.statusCode !== 304) {
      return new NextResponse(existing.stream, {
        status: 200,
        headers: {
          "Content-Type": existing.blob.contentType ?? "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch {
    // Blob not found: continue with generation.
  }

  if (isAiImageGenerationDisabled()) {
    return NextResponse.json({ error: "Generazione immagini AI disabilitata" }, { status: 503 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      category: true,
      resolved: true,
      hidden: true,
      imageUrl: true,
    },
  });

  if (!event || event.hidden || event.resolved) {
    return NextResponse.json({ error: "Evento non disponibile" }, { status: 404 });
  }

  if (Date.now() < generationBlockedUntil) {
    if (event.imageUrl?.trim()) {
      return NextResponse.redirect(new URL(event.imageUrl, request.url), { status: 307 });
    }
    return NextResponse.json({ error: "Generazione temporaneamente disattivata" }, { status: 503 });
  }

  try {
    const client = new OpenAI({ apiKey: config.openaiApiKey });
    const isDalle = config.model.startsWith("dall-e-");
    const isGptImage = config.model.startsWith("gpt-image-");
    const prompt = buildLandingTop10Prompt(event.title, event.category);

    const generated = await client.images.generate({
      model: config.model,
      prompt,
      n: 1,
      size: getImageSizeForModel(config.model),
      ...(isDalle
        ? {
            response_format: "b64_json",
            ...(config.model === "dall-e-3"
              ? { quality: "hd", style: "natural" }
              : {}),
          }
        : isGptImage
          ? { quality: "low" }
          : {}),
    });

    const b64 = generated.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "Provider non ha restituito l'immagine" }, { status: 502 });
    }
    const buffer = Buffer.from(b64, "base64");

    await put(blobPath, buffer, {
      access: "private",
      token: config.blobToken,
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return imageResponseFromBuffer(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[api/ai/landing-market-image]", message);
    if (message.toLowerCase().includes("billing hard limit")) {
      generationBlockedUntil = Date.now() + BILLING_COOLDOWN_MS;
    }
    if (event.imageUrl?.trim()) {
      return NextResponse.redirect(new URL(event.imageUrl, request.url), { status: 307 });
    }
    return NextResponse.json({ error: "Errore generazione immagine landing" }, { status: 500 });
  }
}
