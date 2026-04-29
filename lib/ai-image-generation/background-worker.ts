import { after } from 'next/server';
import { isAiImageGenerationDisabled } from '@/lib/check-ai-image-disabled';
import { generateMarketImageForEvent } from './generate-market-image';

const DEFAULT_CONCURRENCY = 2;

function getConcurrency(): number {
  const raw = process.env.AI_IMAGE_BACKGROUND_CONCURRENCY;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_CONCURRENCY;
  }
  return Math.min(parsed, 8);
}

async function runInBackground(eventIds: string[]): Promise<void> {
  if (eventIds.length === 0 || isAiImageGenerationDisabled()) return;

  const uniqueIds = Array.from(new Set(eventIds));
  const queue = [...uniqueIds];
  const workers = Math.min(getConcurrency(), queue.length);

  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (queue.length > 0) {
        const nextId = queue.shift();
        if (!nextId) return;
        try {
          await generateMarketImageForEvent(nextId);
        } catch (error) {
          console.error('[ai-image-generation/background-worker] Failed for event', nextId, error);
        }
      }
    })
  );
}

/**
 * Schedules market image generation after the HTTP response on Vercel/Next.js
 * (`after()` keeps the serverless invocation alive until work finishes).
 * Fuori da un request context Next, esegue il worker come fire-and-forget.
 */
export function enqueueMarketImageGeneration(eventIds: string[]): void {
  if (eventIds.length === 0 || isAiImageGenerationDisabled()) return;

  const run = () =>
    runInBackground(eventIds).catch((error) => {
      console.error('[ai-image-generation/background-worker] Unexpected failure', error);
    });

  try {
    after(async () => {
      try {
        await runInBackground(eventIds);
      } catch (error) {
        console.error("[ai-image-generation/background-worker] Unexpected failure", error);
      }
    });
  } catch {
    void run();
  }
}
