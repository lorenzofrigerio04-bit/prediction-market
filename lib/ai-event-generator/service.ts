/**
 * AI Event Generator - Core service
 * Calls LLM, parses JSON, validates, selects best candidate, maps to Candidate.
 */

import OpenAI from 'openai';
import { isOpenAIDisabled } from '../check-openai-disabled';
import type { Candidate } from '../event-gen-v2/types';
import type { TrendObject } from '../trend-detection/types';
import {
  aiEventGeneratorResponseSchema,
  type AICandidateEventParsed,
} from './schema';
import { getSystemPrompt, buildUserPrompt } from './prompts';
import type { GenerateEventsFromTrendParams, GenerateEventsFromTrendResult } from './types';

const MAX_RETRIES = 2;
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEBUG = process.env.PIPELINE_DEBUG === 'true';

function getOpenAIConfig(): { apiKey: string; model: string } {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY non impostata (richiesta per AI Event Generator)'
    );
  }
  const model = process.env.GENERATION_MODEL?.trim() || DEFAULT_MODEL;
  return { apiKey, model };
}

/** Strip markdown code blocks from LLM response */
function extractJsonFromResponse(text: string): string {
  let cleaned = text.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }
  return cleaned;
}

/** Check if string is a valid URL or known authority */
function isValidResolutionSource(s: string | undefined): boolean {
  if (!s || typeof s !== 'string') return false;
  const trimmed = s.trim();
  if (trimmed.length < 3) return false;
  try {
    new URL(trimmed);
    return true;
  } catch {
    // Allow known authority names (e.g. "CoinGecko", "ANSA")
    const known = [
      'coingecko',
      'coinmarketcap',
      'ansa',
      'reuters',
      'uefa',
      'fifa',
      'istat',
    ];
    return known.some((k) => trimmed.toLowerCase().includes(k));
  }
}

/** Check if condition is quantifiable (numbers, dates, thresholds) */
function isQuantifiableCondition(condition: string): boolean {
  const c = condition.trim().toLowerCase();
  if (c.length < 5) return false;
  // Must contain numeric/measurable hints
  const hasNumber = /\d/.test(c);
  const hasThreshold =
    />=|<=|>|<|supererà|raggiungerà|oltre|sotto|entro|prima del|dopo il/i.test(c);
  const hasMetric =
    /prezzo|price|cap|market|voto|percentuale|%|eur|usd|milioni|miliardi/i.test(c);
  return hasNumber || hasThreshold || hasMetric;
}

/** Validate a single AI candidate; returns rejection reason or null if valid */
function validateAICandidate(
  candidate: AICandidateEventParsed,
  now: Date
): string | null {
  if (!candidate.deadline || candidate.deadline.trim().length === 0) {
    return 'MISSING_DEADLINE';
  }
  const deadlineDate = new Date(candidate.deadline);
  if (isNaN(deadlineDate.getTime())) {
    return 'MISSING_DEADLINE';
  }
  if (deadlineDate <= now) {
    return 'DEADLINE_IN_PAST';
  }

  if (!isQuantifiableCondition(candidate.condition)) {
    return 'MISSING_QUANTIFIABLE_CONDITION';
  }

  if (!isValidResolutionSource(candidate.resolution_source_primary)) {
    return 'MISSING_RESOLUTION_SOURCE';
  }

  const yes = candidate.resolution_criteria?.yes?.trim();
  const no = candidate.resolution_criteria?.no?.trim();
  if (!yes || !no) {
    return 'MISSING_BINARY_OUTCOME';
  }

  return null;
}

/** Map AICandidateEventParsed to Candidate */
function toCandidate(
  candidate: AICandidateEventParsed,
  trend: TrendObject
): Candidate {
  const resolutionUrl = candidate.resolution_source_primary;
  let resolutionAuthorityHost = 'example.com';
  try {
    const url = new URL(resolutionUrl);
    resolutionAuthorityHost = url.hostname;
  } catch {
    // Use sanitized string as fallback (e.g. "CoinGecko" -> "coingecko.com" approximation)
    resolutionAuthorityHost =
      resolutionUrl.replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase() || 'example.com';
  }

  const title = candidate.title?.trim();
  const question =
    title && title.endsWith('?')
      ? title
      : `${candidate.condition} per ${candidate.subject_entity}?`;

  return {
    title: question,
    description: 'ai-event-generator',
    category: candidate.category,
    closesAt: new Date(candidate.deadline),
    resolutionAuthorityHost,
    resolutionAuthorityType: 'REPUTABLE',
    resolutionCriteriaYes: candidate.resolution_criteria.yes,
    resolutionCriteriaNo: candidate.resolution_criteria.no,
    sourceStorylineId: `trend:${trend.topic}`,
    templateId: 'ai-event-generator',
    resolutionSourceUrl: resolutionUrl || null,
    timezone: 'Europe/Rome',
    resolutionCriteriaFull: `${candidate.resolution_criteria.yes} | ${candidate.resolution_criteria.no}`,
  };
}

/**
 * Generate a single CandidateEvent from a TrendObject using AI.
 */
export async function generateEventsFromTrend(
  params: GenerateEventsFromTrendParams
): Promise<GenerateEventsFromTrendResult> {
  const { trend, now = new Date() } = params;
  const rejectionReasons: string[] = [];

  if (isOpenAIDisabled()) {
    return { candidate: null, candidatesGenerated: 0, rejectionReasons: ['OPENAI_DISABLED'] };
  }

  const config = getOpenAIConfig();
  const client = new OpenAI({ apiKey: config.apiKey });

  const systemPrompt = getSystemPrompt();
  const userPrompt = buildUserPrompt(trend, now);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) {
        rejectionReasons.push('LLM_ERROR');
        return { candidate: null, candidatesGenerated: 0, rejectionReasons };
      }

      const jsonStr = extractJsonFromResponse(raw);
      const parsed = JSON.parse(jsonStr);

      const parseResult = aiEventGeneratorResponseSchema.safeParse(parsed);
      if (!parseResult.success) {
        rejectionReasons.push('INVALID_STRUCTURE');
        if (DEBUG) {
          console.warn('[AI Event Generator] Schema validation failed:', parseResult.error.message);
        }
        return {
          candidate: null,
          candidatesGenerated: parsed?.candidates?.length ?? 0,
          rejectionReasons,
        };
      }

      const { candidates, best_index } = parseResult.data;
      const validCandidates: Array<{ candidate: AICandidateEventParsed; index: number }> = [];

      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        const reason = validateAICandidate(c, now);
        if (reason) {
          rejectionReasons.push(reason);
        } else {
          validCandidates.push({ candidate: c, index: i });
        }
      }

      if (validCandidates.length === 0) {
        return {
          candidate: null,
          candidatesGenerated: candidates.length,
          rejectionReasons,
        };
      }

      // Select best: use best_index if that candidate is valid, else first valid
      let selected = validCandidates[0];
      if (best_index !== undefined && best_index >= 0 && best_index <= 2) {
        const byIndex = validCandidates.find((v) => v.index === best_index);
        if (byIndex) selected = byIndex;
      }

      const candidate = toCandidate(selected.candidate, trend);
      return {
        candidate,
        candidatesGenerated: candidates.length,
        rejectionReasons,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        if (DEBUG) {
          console.warn('[AI Event Generator] Retry', attempt + 1, 'after error:', lastError.message);
        }
      } else {
        rejectionReasons.push('LLM_ERROR');
        if (DEBUG) {
          console.error('[AI Event Generator] Error:', lastError);
        }
        return {
          candidate: null,
          candidatesGenerated: 0,
          rejectionReasons,
        };
      }
    }
  }

  rejectionReasons.push('LLM_ERROR');
  return {
    candidate: null,
    candidatesGenerated: 0,
    rejectionReasons,
  };
}
