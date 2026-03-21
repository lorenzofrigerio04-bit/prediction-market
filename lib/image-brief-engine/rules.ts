/**
 * Image Brief Engine - Brief generation rules
 *
 * Subject extraction, scene construction, symbolism, and category-based
 * style preset selection. Deterministic rules for psychologically engaging
 * images that remain truthful (no outcome spoilers).
 */

import type { ImageBriefInput, StylePresetId } from './types';
import type { ImageBrief } from '../event-gen-v2/types';
import { STYLE_PRESETS, getPresetById } from './presets';

/** Category to style preset mapping */
const CATEGORY_TO_PRESET: Record<string, StylePresetId> = {
  Crypto: 'market_chart_abstract',
  Economia: 'market_chart_abstract',
  Economy: 'market_chart_abstract',
  Sport: 'sports_action',
  Sports: 'sports_action',
  Politica: 'political_symbolic',
  Politics: 'political_symbolic',
  Tecnologia: 'minimal_iconic',
  Technology: 'minimal_iconic',
  Tech: 'minimal_iconic',
  Cultura: 'editorial_photo',
  Culture: 'editorial_photo',
  Intrattenimento: 'editorial_photo',
  Entertainment: 'editorial_photo',
  Scienza: 'editorial_photo',
  Science: 'editorial_photo',
};

/** Generic/stop words to exclude from subject_entities */
const STOP_WORDS = new Set([
  'il', 'la', 'lo', 'i', 'le', 'gli', 'un', 'una', 'uno', 'di', 'da', 'in', 'su', 'per', 'con', 'tra', 'fra',
  'the', 'a', 'an', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'will', 'would', 'could', 'should', 'may', 'might', 'can', 'entro', 'prima', 'del', 'della', 'del',
  'raggiungere', 'superare', 'toccare', 'vincere', 'conquistare', 'rilasciare', 'conseguire',
  'raggiungerà', 'supererà', 'toccherà', 'vincerà', 'conquisterà', 'rilascerà', 'conseguirà',
  '?', '!', '.', ',',
]);

const MAX_SUBJECT_ENTITIES = 5;
const MIN_WORD_LENGTH = 2;
const ALT_TEXT_MIN = 90;
const ALT_TEXT_MAX = 140;

/**
 * Get style preset for a category. Fallback: cinematic_noir.
 */
export function getStylePresetForCategory(category: string): StylePresetId {
  const normalized = category?.trim() || '';
  return CATEGORY_TO_PRESET[normalized] ?? 'cinematic_noir';
}

/**
 * Fallback style preset for retry-on-failure (simpler, fewer tokens).
 * Used when primary generation fails after retries.
 */
export function getFallbackStylePreset(): StylePresetId {
  return 'minimal_iconic';
}

/**
 * Rebuild final prompt from an existing ImageBrief using a different style preset.
 * Used for fallback retry when primary generation fails.
 */
export function buildFinalPromptWithPreset(
  brief: ImageBrief,
  presetId: StylePresetId
): string {
  const preset = getPresetById(presetId);
  const topicTitle =
    brief.subject_entities?.length > 0
      ? brief.subject_entities.join(', ')
      : 'market event';
  const input: ImageBriefInput = {
    title: topicTitle,
    category: '',
    description: null,
    templateId: null,
  };
  return buildFinalPrompt(
    input,
    presetId,
    brief.scene_description,
    preset.compositionHint,
    brief.symbolism
  );
}

/**
 * Extract subject entities from title. Max 5, avoid stop words and short tokens.
 */
export function extractSubjectEntities(title: string): string[] {
  const tokens = title
    .replace(/[?!.,;:()[\]]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(t.toLowerCase()));

  const seen = new Set<string>();
  const result: string[] = [];
  for (const t of tokens) {
    const lower = t.toLowerCase();
    if (!seen.has(lower) && result.length < MAX_SUBJECT_ENTITIES) {
      seen.add(lower);
      result.push(t);
    }
  }
  return result.length > 0 ? result : [title.slice(0, 30).trim() || 'market'];
}

/**
 * Build symbolic scene description. Must not imply outcome; prefer "moment before", "decision point".
 */
export function buildSceneDescription(input: ImageBriefInput): string {
  const { title, category, description } = input;
  const desc = (description || '').trim().slice(0, 120);
  const base = desc ? `${title}. Context: ${desc}` : title;
  return `Symbolic scene evoking the theme of: ${base}. One clear visual moment, moment before outcome, no resolution implied.`;
}

/**
 * Build mood tags: preset defaults + prediction-market engagement (tension, curiosity).
 */
export function buildMoodTags(presetId: StylePresetId): string[] {
  const preset = getPresetById(presetId);
  const engagement = ['tension', 'curiosity', 'anticipation'];
  const combined = [...new Set([...preset.defaultMoodTags, ...engagement])];
  return combined.slice(0, 6);
}

/**
 * Build composition from preset.
 */
export function buildComposition(presetId: StylePresetId): string {
  return getPresetById(presetId).compositionHint;
}

/**
 * Build optional symbolism hint based on category.
 */
export function buildSymbolism(input: ImageBriefInput, presetId: StylePresetId): string | undefined {
  const { category } = input;
  const c = (category || '').toLowerCase();
  if (c.includes('crypto') || c.includes('econom')) {
    return 'Abstract representation of volatility, thresholds, or market movement. No literal numbers.';
  }
  if (c.includes('sport')) {
    return 'Moment of peak competition, before outcome. Athletic energy, stakes.';
  }
  if (c.includes('politic')) {
    return 'Symbolic elements of decision-making: empty podium, ballot, threshold. No identifiable people.';
  }
  if (c.includes('tech')) {
    return 'Iconic product or symbolic release moment. Anticipation.';
  }
  return 'Symbolic scene that evokes the theme without depicting resolution.';
}

/**
 * Build final prompt for OpenAI. Must be photo-descriptive, no text, no logos.
 */
export function buildFinalPrompt(
  input: ImageBriefInput,
  presetId: StylePresetId,
  scene: string,
  composition: string,
  symbolism?: string
): string {
  const preset = getPresetById(presetId);
  const topicBlock = `Topic to illustrate (translate into one clear visual): "${input.title}". ${scene}`;
  const symbolismBlock = symbolism ? ` Symbolism: ${symbolism}.` : '';
  return (
    `Create a single photorealistic photograph. ${topicBlock}.${symbolismBlock} ` +
    `${preset.promptFragment} ` +
    `Composition: ${composition}. ` +
    `The scene must be immediately understandable and visually represent the theme. ` +
    `No text, no logos, no captions, no watermark, no cartoon or illustration, no identifiable faces. ` +
    `Suitable for social media: visually striking, professional, universally appealing.`
  );
}

/**
 * Build negative prompt. Always include base exclusions.
 */
export function buildNegativePrompt(presetId: StylePresetId): string {
  const preset = getPresetById(presetId);
  const base = 'text, logos, watermarks, captions, identifiable faces, cartoon, illustration';
  return preset.negativePromptFragment || base;
}

/**
 * Build alt text. Length 90–140 chars. Format: Decorative illustration... Does not affect resolution.
 */
export function buildAltText(sceneSummary: string, moodSummary: string): string {
  const prefix = 'Decorative illustration for prediction market: ';
  const suffix = '. Does not affect resolution.';
  const middle = `${sceneSummary}. ${moodSummary}`.trim();
  const maxMiddle = ALT_TEXT_MAX - prefix.length - suffix.length;
  const truncated =
    middle.length > maxMiddle ? middle.slice(0, maxMiddle - 3).trim() + '...' : middle;
  let alt = prefix + truncated + suffix;
  if (alt.length < ALT_TEXT_MIN) {
    const pad = sceneSummary.slice(0, Math.min(40, ALT_TEXT_MIN - alt.length));
    alt = prefix + truncated + (pad ? '. ' + pad : '') + suffix;
  }
  if (alt.length > ALT_TEXT_MAX) {
    alt = alt.slice(0, ALT_TEXT_MAX);
  }
  return alt;
}

export { ALT_TEXT_MIN, ALT_TEXT_MAX };
