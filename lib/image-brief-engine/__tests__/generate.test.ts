import { describe, it, expect } from 'vitest';
import { generateImageBrief } from '../generate';
import { validateImageBrief } from '../validate';

describe('generateImageBrief', () => {
  it('returns valid ImageBrief with all required fields', () => {
    const input = {
      title: 'Bitcoin supererà 100.000 USD entro il 15 marzo?',
      category: 'Crypto',
      description: 'Previsione sul prezzo di Bitcoin.',
    };
    const brief = generateImageBrief(input);
    expect(brief.subject_entities).toBeDefined();
    expect(brief.scene_description).toBeTruthy();
    expect(brief.mood_tags.length).toBeGreaterThan(0);
    expect(brief.composition).toBeTruthy();
    expect(brief.style_preset).toBe('market_chart_abstract');
    expect(brief.final_prompt).toBeTruthy();
    expect(brief.negative_prompt).toBeTruthy();
    expect(brief.alt_text).toBeTruthy();
  });

  it('alt_text is 90-140 chars', () => {
    const input = {
      title: 'Inter vincerà il campionato entro il 30 aprile?',
      category: 'Sport',
      description: 'Scommessa sul campionato.',
    };
    const brief = generateImageBrief(input);
    expect(brief.alt_text.length).toBeGreaterThanOrEqual(90);
    expect(brief.alt_text.length).toBeLessThanOrEqual(140);
  });

  it('selects sports_action for Sport category', () => {
    const brief = generateImageBrief({
      title: 'Milan vincerà la Champions?',
      category: 'Sport',
    });
    expect(brief.style_preset).toBe('sports_action');
  });

  it('selects political_symbolic for Politica category', () => {
    const brief = generateImageBrief({
      title: 'Il candidato otterrà la nomination?',
      category: 'Politica',
    });
    expect(brief.style_preset).toBe('political_symbolic');
  });

  it('selects minimal_iconic for Tecnologia category', () => {
    const brief = generateImageBrief({
      title: 'Apple rilascerà iPhone 16?',
      category: 'Tecnologia',
    });
    expect(brief.style_preset).toBe('minimal_iconic');
  });

  it('uses chosenTitle when provided', () => {
    const input = {
      title: 'Original title',
      category: 'Crypto',
    };
    const brief = generateImageBrief(input, 'Chosen title for image');
    expect(brief.subject_entities).toContain('Chosen');
    expect(brief.final_prompt).toContain('Chosen title for image');
  });

  it('extracts subject_entities from title', () => {
    const brief = generateImageBrief({
      title: 'Bitcoin Ethereum supereranno 100k?',
      category: 'Crypto',
    });
    expect(brief.subject_entities.length).toBeGreaterThan(0);
    expect(brief.subject_entities.length).toBeLessThanOrEqual(5);
  });

  it('generated brief passes validation', () => {
    const brief = generateImageBrief({
      title: 'Test market title',
      category: 'Economia',
      description: 'Test description',
    });
    const result = validateImageBrief(brief);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('final_prompt excludes text and logos', () => {
    const brief = generateImageBrief({
      title: 'Test',
      category: 'Crypto',
    });
    const lower = brief.final_prompt.toLowerCase();
    expect(lower).toContain('no text');
    expect(lower).toContain('no logos');
  });

  it('negative_prompt includes required terms', () => {
    const brief = generateImageBrief({
      title: 'Test',
      category: 'Sport',
    });
    const lower = (brief.negative_prompt || '').toLowerCase();
    expect(lower).toContain('text');
    expect(lower).toContain('logos');
    expect(lower).toContain('watermarks');
  });
});
