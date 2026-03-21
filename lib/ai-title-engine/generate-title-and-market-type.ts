/**
 * Una chiamata LLM per candidato: restituisce market_type + title (formato Polymarket).
 * Fallback: in caso di errore il chiamante usa il titolo rule-based.
 * Supporta i 9 tipi di mercato canonici (lib/market-types).
 */

import OpenAI from 'openai';
import { MARKET_TYPE_IDS, isMarketTypeId } from '@/lib/market-types';
import { getAITitleEngineConfig } from './config';
import type { AITitleResult } from './types';
import { LEGACY_MARKET_TYPE_MAP } from './types';
import { getSystemPrompt, buildUserPrompt } from './prompts';

const MARKET_TYPES_SET = new Set<string>(MARKET_TYPE_IDS);
const MAX_TITLE_LENGTH = 110;

function extractJsonFromResponse(text: string): string {
  let cleaned = text.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }
  return cleaned;
}

function normalizeTitle(t: string): string {
  let s = t.trim();
  if (!s) return s;
  if (!s.endsWith('?')) s = `${s}?`;
  if (s.length > MAX_TITLE_LENGTH) {
    s = s.slice(0, MAX_TITLE_LENGTH - 1).trim();
    if (!s.endsWith('?')) s = `${s}?`;
  }
  return s;
}

/**
 * Genera titolo e market type per un singolo claim.
 * Restituisce null in caso di errore o AI disabilitata (il chiamante userà fallback).
 */
export async function generateTitleAndMarketType(
  rawTitle: string,
  category?: string
): Promise<AITitleResult | null> {
  const config = getAITitleEngineConfig();
  if (!config.enabled || !config.openaiApiKey) {
    return null;
  }

  const client = new OpenAI({ apiKey: config.openaiApiKey });

  try {
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: buildUserPrompt(rawTitle, category) },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    const jsonStr = extractJsonFromResponse(raw);
    const parsed = JSON.parse(jsonStr) as { market_type?: string; title?: string };

    let marketType = parsed.market_type?.toUpperCase?.();
    if (!marketType) return null;
    // Mappa legacy MULTI_OUTCOME → MULTIPLE_CHOICE
    const mapped = LEGACY_MARKET_TYPE_MAP[marketType];
    if (mapped) marketType = mapped;
    if (!MARKET_TYPES_SET.has(marketType) || !isMarketTypeId(marketType)) {
      return null;
    }

    const title = typeof parsed.title === 'string' ? normalizeTitle(parsed.title) : '';
    if (!title) return null;

    return {
      market_type: marketType,
      title,
    };
  } catch {
    return null;
  }
}
