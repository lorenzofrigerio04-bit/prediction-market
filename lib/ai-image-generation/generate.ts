/**
 * Generazione immagine AI per post con type AI_IMAGE (Step 9).
 * Carica post+evento, costruisce prompt, chiama OpenAI Images, carica su Vercel Blob, aggiorna Post.aiImageUrl.
 */

import OpenAI from "openai";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getAiImageGenerationConfig } from "./config";

const PROMPT_TITLE_MAX_LEN = 220;
const PROMPT_DESC_MAX_LEN = 180;
const PROMPT_CATEGORY_MAX_LEN = 50;

export type GenerateResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Sanitizza testo per il prompt: lunghezza massima e rimozione caratteri di controllo.
 */
function sanitizePromptText(value: string, maxLen: number): string {
  const trimmed = value
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen).trim();
}

/**
 * Prompt per GPT Image 1.5: immagine foto-descrittiva che rispecchia perfettamente l'evento,
 * estremamente realistica, adatta a social e di appeal universale.
 * Usa linguaggio da fotografia (inquadratura, luce, composizione) per massimizzare il realismo.
 */
function buildPrompt(
  title: string,
  category: string,
  description?: string | null
): string {
  const safeTitle = sanitizePromptText(title, PROMPT_TITLE_MAX_LEN);
  const safeCategory = sanitizePromptText(category, PROMPT_CATEGORY_MAX_LEN);
  const safeDesc = description
    ? sanitizePromptText(description, PROMPT_DESC_MAX_LEN)
    : "";

  const topicBlock = safeDesc
    ? `Topic to illustrate (translate into one clear visual): "${safeTitle}". Context: ${safeDesc}. Category: ${safeCategory}.`
    : `Topic to illustrate (translate into one clear visual): "${safeTitle}". Category: ${safeCategory}.`;

  return (
    `Create a single photorealistic photograph that directly and accurately depicts this exact topic. ${topicBlock} ` +
    `The image must look like a real photograph: natural lighting, real-world setting, authentic materials and textures. ` +
    `Shot as if with a 35mm or 50mm lens, one clear subject in focus, balanced composition, eye-level perspective. ` +
    `Soft natural light or editorial-style lighting, shallow depth of field, subtle detail. ` +
    `The scene must be immediately understandable and visually represent what the news or event is about. ` +
    `No text, no logos, no captions, no watermark, no cartoon or illustration. ` +
    `Suitable for social media: visually striking, professional, universally appealing, shareable quality.`
  );
}

/**
 * Genera l'immagine per il post e aggiorna Post.aiImageUrl.
 * Restituisce { ok: true, url } in caso di successo, { ok: false, error } altrimenti.
 */
export async function generateEventImageForPost(
  postId: string
): Promise<GenerateResult> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      event: {
        select: { title: true, category: true, description: true },
      },
    },
  });

  if (!post) {
    return { ok: false, error: "Post non trovato" };
  }
  if (post.type !== "AI_IMAGE") {
    return { ok: false, error: "Post non è di tipo AI_IMAGE" };
  }
  if (post.aiImageUrl?.trim()) {
    return { ok: false, error: "Post ha già aiImageUrl" };
  }
  if (!post.event) {
    return { ok: false, error: "Evento non trovato" };
  }

  const config = getAiImageGenerationConfig();
  const prompt = buildPrompt(
    post.event.title ?? "",
    post.event.category ?? "",
    post.event.description
  );

  console.log("[ai-image-generation] Starting for postId:", postId, "model:", config.model);
  const isDalle = config.model.startsWith("dall-e-");
  const isGptImage = config.model.startsWith("gpt-image-");
  let b64Data: string;
  try {
    const client = new OpenAI({ apiKey: config.openaiApiKey });
    const response = await client.images.generate({
      model: config.model,
      prompt,
      n: 1,
      size: "1024x1024",
      ...(isDalle
        ? {
            response_format: "b64_json" as const,
            ...(config.model === "dall-e-3"
              ? { quality: "hd" as const, style: "natural" as const }
              : {}),
          }
        : isGptImage
          ? { quality: "medium" as const }
          : {}),
    });

    const first = response.data?.[0];
    if (!first?.b64_json) {
      const err = new Error("OpenAI non ha restituito b64_json");
      console.error("[ai-image-generation]", err);
      return { ok: false, error: err.message };
    }
    b64Data = first.b64_json;
    console.log("[ai-image-generation] OpenAI success for postId:", postId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ai-image-generation] OpenAI error for postId:", postId, "→", message);
    return { ok: false, error: message };
  }

  /** Con store Blob privato usiamo una route API che inoltra il blob; con store pubblico useremmo blob.url. */
  const blobPath = `ai-images/${postId}.png`;
  try {
    const buffer = Buffer.from(b64Data, "base64");
    await put(blobPath, buffer, {
      access: "private",
      token: config.blobToken,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ai-image-generation] Blob upload error:", err);
    return { ok: false, error: message };
  }

  const proxyUrl = `/api/ai/post-image?postId=${encodeURIComponent(postId)}`;
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { aiImageUrl: proxyUrl },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ai-image-generation] DB update error:", err);
    return { ok: false, error: message };
  }

  console.log("[ai-image-generation] Done for postId:", postId, "proxy:", proxyUrl);
  return { ok: true, url: proxyUrl };
}
