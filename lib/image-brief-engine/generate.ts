/**
 * Image Brief Engine - Main entry point
 *
 * Generates ImageBrief from CandidateEvent + chosen title.
 * Output: image brief, final prompt, negative prompt, alt text (90–140 chars).
 */

import type { ImageBrief } from '../event-gen-v2/types';
import type { ImageBriefInput } from './types';
import {
  getStylePresetForCategory,
  extractSubjectEntities,
  buildSceneDescription,
  buildMoodTags,
  buildComposition,
  buildSymbolism,
  buildFinalPrompt,
  buildNegativePrompt,
  buildAltText,
} from './rules';

const PROMPT_TITLE_MAX_LEN = 220;
const PROMPT_DESC_MAX_LEN = 180;
const PROMPT_CATEGORY_MAX_LEN = 50;

function sanitize(value: string, maxLen: number): string {
  const trimmed = value
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return trimmed.length <= maxLen ? trimmed : trimmed.slice(0, maxLen).trim();
}

/**
 * Generate a full ImageBrief from candidate input and chosen title.
 *
 * @param input - CandidateEvent subset (title, category, description, templateId)
 * @param chosenTitle - The title to use (defaults to input.title)
 * @returns ImageBrief with all fields populated
 */
export function generateImageBrief(
  input: ImageBriefInput,
  chosenTitle?: string
): ImageBrief {
  const title = sanitize(chosenTitle ?? input.title, PROMPT_TITLE_MAX_LEN);
  const category = sanitize(input.category, PROMPT_CATEGORY_MAX_LEN);
  const description = input.description
    ? sanitize(input.description, PROMPT_DESC_MAX_LEN)
    : null;

  const normalizedInput: ImageBriefInput = {
    title,
    category,
    description,
    templateId: input.templateId,
  };

  const stylePreset = getStylePresetForCategory(category);
  const subject_entities = extractSubjectEntities(title);
  const scene_description = buildSceneDescription(normalizedInput);
  const mood_tags = buildMoodTags(stylePreset);
  const composition = buildComposition(stylePreset);
  const symbolism = buildSymbolism(normalizedInput, stylePreset);
  const negative_prompt = buildNegativePrompt(stylePreset);
  const final_prompt = buildFinalPrompt(
    normalizedInput,
    stylePreset,
    scene_description,
    composition,
    symbolism
  );

  const sceneSummary = title.slice(0, 50) + (title.length > 50 ? '...' : '');
  const moodSummary = mood_tags.slice(0, 2).join(', ');
  const alt_text = buildAltText(sceneSummary, moodSummary);

  return {
    subject_entities,
    scene_description,
    mood_tags,
    composition,
    symbolism,
    style_preset: stylePreset,
    final_prompt,
    negative_prompt,
    alt_text,
  };
}
