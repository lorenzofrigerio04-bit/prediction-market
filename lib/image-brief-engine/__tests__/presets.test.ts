import { describe, it, expect } from 'vitest';
import {
  STYLE_PRESETS,
  STYLE_PRESET_IDS,
  getPresetById,
  isStylePresetId,
} from '../presets';
import { getStylePresetForCategory } from '../rules';

describe('presets', () => {
  it('has all 6 style presets', () => {
    expect(STYLE_PRESET_IDS).toHaveLength(6);
    expect(STYLE_PRESET_IDS).toContain('editorial_photo');
    expect(STYLE_PRESET_IDS).toContain('cinematic_noir');
    expect(STYLE_PRESET_IDS).toContain('sports_action');
    expect(STYLE_PRESET_IDS).toContain('market_chart_abstract');
    expect(STYLE_PRESET_IDS).toContain('political_symbolic');
    expect(STYLE_PRESET_IDS).toContain('minimal_iconic');
  });

  it('each preset has required fields', () => {
    for (const id of STYLE_PRESET_IDS) {
      const p = getPresetById(id);
      expect(p.id).toBe(id);
      expect(p.name).toBeTruthy();
      expect(p.promptFragment).toBeTruthy();
      expect(Array.isArray(p.defaultMoodTags)).toBe(true);
      expect(p.compositionHint).toBeTruthy();
      expect(p.negativePromptFragment).toBeTruthy();
    }
  });

  it('isStylePresetId returns true for valid ids', () => {
    expect(isStylePresetId('editorial_photo')).toBe(true);
    expect(isStylePresetId('cinematic_noir')).toBe(true);
  });

  it('isStylePresetId returns false for invalid ids', () => {
    expect(isStylePresetId('photorealistic')).toBe(false);
    expect(isStylePresetId('')).toBe(false);
  });
});

describe('getStylePresetForCategory', () => {
  it('maps Crypto to market_chart_abstract', () => {
    expect(getStylePresetForCategory('Crypto')).toBe('market_chart_abstract');
  });

  it('maps Sport to sports_action', () => {
    expect(getStylePresetForCategory('Sport')).toBe('sports_action');
  });

  it('maps Politica to political_symbolic', () => {
    expect(getStylePresetForCategory('Politica')).toBe('political_symbolic');
  });

  it('maps Economia to market_chart_abstract', () => {
    expect(getStylePresetForCategory('Economia')).toBe('market_chart_abstract');
  });

  it('maps Tecnologia to minimal_iconic', () => {
    expect(getStylePresetForCategory('Tecnologia')).toBe('minimal_iconic');
  });

  it('maps Cultura to editorial_photo', () => {
    expect(getStylePresetForCategory('Cultura')).toBe('editorial_photo');
  });

  it('fallback for unknown category is cinematic_noir', () => {
    expect(getStylePresetForCategory('Unknown')).toBe('cinematic_noir');
    expect(getStylePresetForCategory('')).toBe('cinematic_noir');
  });
});
