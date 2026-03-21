/**
 * ImageGenerationService - Orchestrates AI image generation with retry,
 * fallback style preset, storage integration, and metrics.
 */

import type {
  GenerateImageInput,
  GenerateImageResult,
  ImageProviderAdapter,
  StorageAdapter,
} from './types';
import { getAiImageGenerationConfig } from './config';
import { getFallbackStylePreset, buildFinalPromptWithPreset } from '@/lib/image-brief-engine';
import { isStylePresetId } from '@/lib/image-brief-engine';
import { createOpenAIImageAdapter } from './adapters/openai-adapter';
import { createVercelBlobStorageAdapter } from './adapters/storage-adapter';

const NO_B64_JSON_MSG = 'OpenAI non ha restituito b64_json';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ImageGenerationServiceOptions {
  provider: ImageProviderAdapter;
  storage: StorageAdapter;
}

export class ImageGenerationService {
  constructor(private readonly options: ImageGenerationServiceOptions) {}

  static createDefault(): ImageGenerationService {
    return new ImageGenerationService({
      provider: createOpenAIImageAdapter(),
      storage: createVercelBlobStorageAdapter(),
    });
  }

  async generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
    const config = getAiImageGenerationConfig();
    const startTime = Date.now();
    let totalAttempts = 0;
    let fallbackUsed = false;

    const runAttempt = async (
      prompt: string,
      maxAttempts: number,
      useFallback: boolean
    ): Promise<GenerateImageResult> => {
      let lastError: string | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        totalAttempts++;
        try {
          const result = await this.options.provider.generate(prompt, {
            stylePreset: useFallback ? config.fallbackStylePreset : undefined,
          });

          const buffer = Buffer.from(result.b64Data, 'base64');

          for (let uploadAttempt = 1; uploadAttempt <= 2; uploadAttempt++) {
            try {
              const imageUrl = await this.options.storage.uploadImage(
                input.market_id,
                buffer
              );
              const duration = Date.now() - startTime;
              const providerMetadata: Record<string, unknown> = {
                ...result.metadata,
                fallback_used: fallbackUsed,
              };

              return {
                ok: true,
                image_url: imageUrl,
                request_id: result.requestId ?? null,
                provider_metadata: providerMetadata,
                metrics: {
                  attempts: totalAttempts,
                  fallback_used: fallbackUsed,
                  duration_ms: duration,
                  status: 'SUCCESS',
                },
              };
            } catch (uploadErr) {
              const msg = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
              lastError = `Blob upload failed: ${msg}`;
              if (uploadAttempt < 2) {
                await sleep(config.retryDelayMs);
              }
            }
          }

          lastError = lastError ?? 'Blob upload failed';
          const duration = Date.now() - startTime;
          return {
            ok: false,
            error: lastError,
            retried: totalAttempts > 1,
            skipFallback: true,
            metrics: {
              attempts: totalAttempts,
              fallback_used: fallbackUsed,
              duration_ms: duration,
              status: 'FAILED',
            },
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          lastError = message;

          if (message.includes(NO_B64_JSON_MSG)) {
            const duration = Date.now() - startTime;
            return {
              ok: false,
              error: message,
              retried: totalAttempts > 1,
              metrics: {
                attempts: totalAttempts,
                fallback_used: fallbackUsed,
                duration_ms: duration,
                status: 'FAILED',
              },
            };
          }

          if (attempt < maxAttempts) {
            await sleep(config.retryDelayMs * Math.pow(2, attempt - 1));
          }
        }
      }

      const duration = Date.now() - startTime;
      return {
        ok: false,
        error: lastError ?? 'Generation failed',
        retried: totalAttempts > 1,
        metrics: {
          attempts: totalAttempts,
          fallback_used: fallbackUsed,
          duration_ms: duration,
          status: 'FAILED',
        },
      };
    };

    const primaryResult = await runAttempt(
      input.image_brief.final_prompt,
      config.maxRetries,
      false
    );

    if (primaryResult.ok) {
      return primaryResult;
    }

    if (!primaryResult.ok && primaryResult.skipFallback) {
      return primaryResult;
    }

    fallbackUsed = true;
    const fallbackPresetId = isStylePresetId(config.fallbackStylePreset)
      ? config.fallbackStylePreset
      : getFallbackStylePreset();
    const fallbackPrompt = buildFinalPromptWithPreset(input.image_brief, fallbackPresetId);

    return runAttempt(fallbackPrompt, 1, true);
  }
}
