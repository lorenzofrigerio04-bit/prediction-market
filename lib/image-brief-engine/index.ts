/**
 * Image Brief Engine
 *
 * Generates psychologically engaging, rule-compliant image briefs from
 * CandidateEvent + chosen title. Images are decorative assets and do not
 * affect market resolution.
 *
 * @example
 * ```ts
 * import { generateImageBrief } from '@/lib/image-brief-engine';
 *
 * const brief = generateImageBrief(
 *   { title: 'Bitcoin supererà 100k?', category: 'Crypto', description: '...' },
 *   'Bitcoin supererà 100k?'
 * );
 * // brief.final_prompt, brief.negative_prompt, brief.alt_text
 * ```
 */

export { generateImageBrief } from './generate';
export { validateImageBrief, isValidImageBrief } from './validate';
export {
  getStylePresetForCategory,
  getFallbackStylePreset,
  buildFinalPromptWithPreset,
  extractSubjectEntities,
  buildSceneDescription,
  buildMoodTags,
  buildComposition,
  buildSymbolism,
  buildFinalPrompt,
  buildNegativePrompt,
  buildAltText,
} from './rules';
export {
  STYLE_PRESETS,
  STYLE_PRESET_IDS,
  getPresetById,
  isStylePresetId,
} from './presets';
export {
  getExampleBriefs,
  exampleCryptoBrief,
  exampleSportBrief,
  examplePoliticaBrief,
  EXAMPLE_INPUTS,
} from './examples';

export type {
  ImageBrief,
  ImageBriefInput,
  StylePresetId,
  StylePreset,
  ValidationResult,
} from './types';
