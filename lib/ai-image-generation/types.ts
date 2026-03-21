/**
 * Image Generation Service - Shared types and interfaces
 */

import type { ImageBrief } from '@/lib/event-gen-v2/types';

export interface GenerateImageInput {
  market_id: string;
  image_brief: ImageBrief;
}

export type GenerateImageResult =
  | {
      ok: true;
      image_url: string;
      request_id: string | null;
      provider_metadata: Record<string, unknown>;
      metrics: GenerationMetrics;
    }
  | {
      ok: false;
      error: string;
      retried?: boolean;
      /** When true, do not retry with fallback style preset (e.g. upload failed) */
      skipFallback?: boolean;
      metrics: GenerationMetrics;
    };

export interface ImageProviderAdapter {
  generate(
    prompt: string,
    options?: { stylePreset?: string }
  ): Promise<{
    b64Data: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
  }>;
}

export interface StorageAdapter {
  uploadImage(eventId: string, buffer: Buffer): Promise<string>;
}

export interface GenerationMetrics {
  attempts: number;
  fallback_used: boolean;
  duration_ms: number;
  status: 'SUCCESS' | 'FAILED';
}
