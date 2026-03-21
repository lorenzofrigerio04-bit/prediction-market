/**
 * OpenAI Images API adapter for ImageGenerationService
 */

import OpenAI from 'openai';
import type { ImageProviderAdapter } from '../types';
import { getAiImageGenerationConfig } from '../config';

export function createOpenAIImageAdapter(): ImageProviderAdapter {
  const config = getAiImageGenerationConfig();
  const client = new OpenAI({ apiKey: config.openaiApiKey });
  const isDalle = config.model.startsWith('dall-e-');
  const isGptImage = config.model.startsWith('gpt-image-');

  return {
    async generate(prompt, options) {
      const response = await client.images.generate({
        model: config.model,
        prompt,
        n: 1,
        size: '1024x1024',
        ...(isDalle
          ? {
              response_format: 'b64_json' as const,
              ...(config.model === 'dall-e-3'
                ? { quality: 'hd' as const, style: 'natural' as const }
                : {}),
            }
          : isGptImage
            ? { quality: 'medium' as const }
            : {}),
      });

      const first = response.data?.[0];
      if (!first?.b64_json) {
        throw new Error('OpenAI non ha restituito b64_json');
      }

      const extended = first as { revised_prompt?: string; id?: string };
      const metadata: Record<string, unknown> = {
        model: config.model,
        style_preset: options?.stylePreset ?? null,
        revised_prompt: extended.revised_prompt ?? null,
      };

      return {
        b64Data: first.b64_json,
        requestId: extended.id,
        metadata,
      };
    },
  };
}
