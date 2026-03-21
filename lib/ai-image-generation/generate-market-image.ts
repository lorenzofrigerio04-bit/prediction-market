/**
 * Generazione immagine AI per Event (market-level, Event Gen v2.0).
 * Usa ImageGenerationService con retry, fallback style preset e storage.
 *
 * Images are decorative assets (is_decorative_asset = true) and do NOT affect resolution.
 */

import type { Prisma } from "@prisma/client";
import { createRunId, logPipelineStage } from "@/lib/event-gen-v2/observability";
import { prisma } from "@/lib/prisma";
import { isAiImageGenerationDisabled } from "@/lib/check-ai-image-disabled";
import { getAiImageGenerationConfig } from "./config";
import { ImageGenerationService } from "./image-generation-service";
import type { ImageBrief } from "@/lib/event-gen-v2/types";
import { generateImageBrief, isValidImageBrief } from "@/lib/image-brief-engine";

export type GenerateMarketImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Generates the market image for an Event and updates Event fields.
 * Only processes events with imageGenerationStatus = PENDING or FAILED.
 */
export async function generateMarketImageForEvent(
  eventId: string
): Promise<GenerateMarketImageResult> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      imageGenerationStatus: true,
      imageUrl: true,
      imageBrief: true,
    },
  });

  if (!event) {
    return { ok: false, error: "Evento non trovato" };
  }
  if (event.imageUrl?.trim() && event.imageGenerationStatus === "SUCCESS") {
    return { ok: false, error: "Event ha già immagine" };
  }
  if (
    event.imageGenerationStatus !== "PENDING" &&
    event.imageGenerationStatus !== "FAILED"
  ) {
    return { ok: false, error: `Status non processabile: ${event.imageGenerationStatus}` };
  }
  if (isAiImageGenerationDisabled()) {
    return { ok: false, error: "Generazione immagini AI disabilitata (DISABLE_AI_IMAGE_GENERATION)" };
  }

  let brief: ImageBrief;
  const storedBrief = event.imageBrief as ImageBrief | null | undefined;
  if (storedBrief && isValidImageBrief(storedBrief)) {
    brief = storedBrief;
  } else {
    brief = generateImageBrief(
      {
        title: event.title ?? "",
        category: event.category ?? "",
        description: event.description,
      },
      event.title ?? undefined
    );
  }

  const config = getAiImageGenerationConfig();
  console.log("[ai-image-generation] Starting for eventId:", eventId, "model:", config.model);

  const runId = createRunId();
  const startMs = Date.now();
  const service = ImageGenerationService.createDefault();
  const result = await service.generateImage({
    market_id: eventId,
    image_brief: brief,
  });

  if (result.ok) {
    try {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          imageUrl: result.image_url,
          imagePrompt: brief.final_prompt,
          imageStyle: brief.style_preset,
          imageSeedOrRequestId: result.request_id ?? undefined,
          imageAltText: brief.alt_text,
          imageGenerationStatus: "SUCCESS",
          imageProvider: config.model,
          imageVersion: "1",
          imageBrief: brief as unknown as Prisma.InputJsonValue,
          imageProviderMetadata:
            result.provider_metadata as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[ai-image-generation] DB update error:", err);
      return { ok: false, error: message };
    }

    logPipelineStage(runId, "image_generation", {
      payload: { eventId, status: "SUCCESS" },
      durationMs: Date.now() - startMs,
    });
    console.log(
      "[ai-image-generation] Done for eventId:",
      eventId,
      "proxy:",
      result.image_url,
      "metrics:",
      JSON.stringify(result.metrics)
    );
    return { ok: true, url: result.image_url };
  }

  logPipelineStage(runId, "image_generation", {
    level: "error",
    payload: { eventId, status: "FAILED", error: result.error },
    durationMs: Date.now() - startMs,
  });
  console.error(
    "[ai-image-generation] Failed for eventId:",
    eventId,
    "error:",
    result.error,
    "metrics:",
    JSON.stringify(result.metrics)
  );

  await prisma.event.update({
    where: { id: eventId },
    data: {
      imageGenerationStatus: "FAILED",
      imageProviderMetadata: result.metrics as unknown as Prisma.InputJsonValue,
    },
  });

  return { ok: false, error: result.error };
}
