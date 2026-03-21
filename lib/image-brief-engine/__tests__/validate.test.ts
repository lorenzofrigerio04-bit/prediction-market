import { describe, it, expect } from 'vitest';
import { validateImageBrief, isValidImageBrief } from '../validate';
import type { ImageBrief } from '../../event-gen-v2/types';

function validBrief(): ImageBrief {
  return {
    subject_entities: ['Bitcoin', '100k'],
    scene_description: 'Symbolic scene for crypto market.',
    mood_tags: ['tension', 'curiosity'],
    composition: '35mm lens, balanced',
    style_preset: 'market_chart_abstract',
    final_prompt: 'Create a photo. No text, no logos, no watermarks.',
    negative_prompt: 'text, logos, watermarks, captions, identifiable faces',
    alt_text: 'Decorative illustration for prediction market: Bitcoin price threshold. Tension, volatility. Does not affect resolution.',
  };
}

describe('validateImageBrief', () => {
  it('passes valid brief', () => {
    const result = validateImageBrief(validBrief());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when alt_text is too short', () => {
    const brief = validBrief();
    brief.alt_text = 'Too short';
    const result = validateImageBrief(brief);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('alt_text'))).toBe(true);
  });

  it('fails when alt_text is too long', () => {
    const brief = validBrief();
    brief.alt_text = 'x'.repeat(150);
    const result = validateImageBrief(brief);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('alt_text'))).toBe(true);
  });

  it('fails when subject_entities is empty', () => {
    const brief = validBrief();
    brief.subject_entities = [];
    const result = validateImageBrief(brief);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('subject_entities'))).toBe(true);
  });

  it('fails when negative_prompt lacks required terms', () => {
    const brief = validBrief();
    brief.negative_prompt = 'cartoon, illustration';
    const result = validateImageBrief(brief);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('negative_prompt'))).toBe(true);
  });

  it('fails when style_preset is invalid', () => {
    const brief = validBrief();
    (brief as { style_preset: string }).style_preset = 'photorealistic';
    const result = validateImageBrief(brief);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('style_preset'))).toBe(true);
  });

  it('fails when final_prompt does not exclude text', () => {
    const brief = validBrief();
    brief.final_prompt = 'Create a photo with a caption.';
    const result = validateImageBrief(brief);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('final_prompt'))).toBe(true);
  });
});

describe('isValidImageBrief', () => {
  it('returns true for valid brief', () => {
    expect(isValidImageBrief(validBrief())).toBe(true);
  });

  it('returns false for invalid brief', () => {
    const brief = validBrief();
    brief.alt_text = 'short';
    expect(isValidImageBrief(brief)).toBe(false);
  });
});
