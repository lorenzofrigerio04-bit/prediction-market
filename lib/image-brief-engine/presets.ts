/**
 * Image Brief Engine - Style preset library
 *
 * Six presets for psychologically engaging, rule-compliant market images.
 * Each preset defines lighting, composition, mood, and exclusions.
 */

import type { StylePreset, StylePresetId } from './types';

export const STYLE_PRESETS: Record<StylePresetId, StylePreset> = {
  editorial_photo: {
    id: 'editorial_photo',
    name: 'Editorial Photography',
    promptFragment:
      'Editorial magazine style, natural lighting, authentic setting, professional photojournalism. Shot as if for a news feature, one clear subject in focus, balanced composition, eye-level perspective. Soft natural or diffused editorial lighting, shallow depth of field.',
    defaultMoodTags: ['editorial', 'professional', 'authentic', 'curiosity'],
    compositionHint: '35mm or 50mm lens, one clear subject, balanced composition, eye-level',
    negativePromptFragment: 'text, logos, watermarks, captions, identifiable faces, cartoon, illustration',
  },
  cinematic_noir: {
    id: 'cinematic_noir',
    name: 'Cinematic Noir',
    promptFragment:
      'Cinematic atmosphere, dramatic chiaroscuro lighting, high contrast shadows, film noir mood. Moody and tense, one clear subject emerging from darkness, atmospheric depth. Shot as if from a thriller, suspenseful composition.',
    defaultMoodTags: ['cinematic', 'tension', 'dramatic', 'suspense', 'mystery'],
    compositionHint: 'Wide aperture, strong shadows, single focal point, atmospheric depth',
    negativePromptFragment: 'text, logos, watermarks, captions, identifiable faces, cartoon, illustration, bright flat lighting',
  },
  sports_action: {
    id: 'sports_action',
    name: 'Sports Action',
    promptFragment:
      'Dynamic sports photography, motion blur or frozen action, athletic energy. Stadium or arena atmosphere, moment of peak tension before outcome. Editorial sports style, dramatic angle, sense of competition and stakes.',
    defaultMoodTags: ['dynamic', 'action', 'tension', 'competition', 'anticipation'],
    compositionHint: 'Action shot, dynamic angle, sense of movement, peak moment',
    negativePromptFragment: 'text, logos, watermarks, captions, identifiable faces, cartoon, illustration, static pose',
  },
  market_chart_abstract: {
    id: 'market_chart_abstract',
    name: 'Market Chart Abstract',
    promptFragment:
      'Abstract representation of financial markets or data: symbolic charts, candlesticks, or metrics as visual metaphor. No literal numbers or text. Moody lighting, editorial feel, sense of volatility and uncertainty. Photorealistic materials and textures.',
    defaultMoodTags: ['abstract', 'volatility', 'uncertainty', 'tension', 'editorial'],
    compositionHint: 'Symbolic composition, abstract shapes suggesting data, one clear focal element',
    negativePromptFragment: 'text, logos, watermarks, captions, identifiable faces, cartoon, illustration, numbers, letters',
  },
  political_symbolic: {
    id: 'political_symbolic',
    name: 'Political Symbolic',
    promptFragment:
      'Symbolic political imagery: empty podium, voting booth, ballot box, or abstract representation of decision-making. No identifiable faces or candidates. Editorial photography style, atmospheric, sense of stakes and moment before outcome.',
    defaultMoodTags: ['symbolic', 'stakes', 'tension', 'editorial', 'anticipation'],
    compositionHint: 'Symbolic composition, empty or abstract elements, no identifiable people',
    negativePromptFragment: 'text, logos, watermarks, captions, identifiable faces, cartoon, illustration, political posters',
  },
  minimal_iconic: {
    id: 'minimal_iconic',
    name: 'Minimal Iconic',
    promptFragment:
      'Minimalist product or tech photography: clean composition, iconic single object or symbolic scene. Soft natural or studio lighting, shallow depth of field. Editorial tech magazine style, sense of anticipation or release.',
    defaultMoodTags: ['minimal', 'iconic', 'anticipation', 'clean', 'professional'],
    compositionHint: 'Single focal element, clean negative space, balanced minimal composition',
    negativePromptFragment: 'text, logos, watermarks, captions, identifiable faces, cartoon, illustration, cluttered',
  },
};

/** All valid style preset IDs */
export const STYLE_PRESET_IDS: StylePresetId[] = [
  'editorial_photo',
  'cinematic_noir',
  'sports_action',
  'market_chart_abstract',
  'political_symbolic',
  'minimal_iconic',
];

export function getPresetById(id: StylePresetId): StylePreset {
  return STYLE_PRESETS[id];
}

export function isStylePresetId(id: string): id is StylePresetId {
  return STYLE_PRESET_IDS.includes(id as StylePresetId);
}
