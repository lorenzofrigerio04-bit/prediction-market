/**
 * Vercel Blob storage adapter for ImageGenerationService
 */

import { put } from '@vercel/blob';
import type { StorageAdapter } from '../types';
import { getAiImageGenerationConfig } from '../config';

export function createVercelBlobStorageAdapter(): StorageAdapter {
  const config = getAiImageGenerationConfig();

  return {
    async uploadImage(eventId: string, buffer: Buffer): Promise<string> {
      const blobPath = `ai-images/markets/${eventId}.png`;
      await put(blobPath, buffer, {
        access: 'private',
        token: config.blobToken,
      });
      return `/api/ai/market-image?eventId=${encodeURIComponent(eventId)}`;
    },
  };
}
