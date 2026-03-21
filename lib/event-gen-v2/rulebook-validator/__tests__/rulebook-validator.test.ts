/**
 * Unit tests for Rulebook Validator v2
 * Covers validation rules, error schema, PASS/FAIL examples.
 */

import { afterEach, describe, it, expect } from 'vitest';
import {
  checkBinaryOutcomes,
  checkDeadline,
  checkResolutionCriteria,
  checkResolutionSource,
  checkTimezone,
  checkTitleVsCriteria,
  checkSourceHierarchy,
  runRulebookV2Rules,
} from '../rules';
import {
  checkImageExists,
  checkImageAltText,
  checkImageNoNewClaims,
  checkImageCompliance,
} from '../image-rules';
import { validateRulebookV2 } from '../validator';
import { validateCandidates } from '../../rulebook-validator';
import { generateImageBrief } from '../../../image-brief-engine';
import type { RulebookV2Input } from '../types';
import type { Candidate } from '../../types';
import type { ImageBrief } from '../../types';

const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const originalMdeEnforceValidation = process.env.MDE_ENFORCE_VALIDATION;

afterEach(() => {
  if (originalMdeEnforceValidation === undefined) {
    delete process.env.MDE_ENFORCE_VALIDATION;
  } else {
    process.env.MDE_ENFORCE_VALIDATION = originalMdeEnforceValidation;
  }
});

function makeInput(overrides?: Partial<RulebookV2Input>): RulebookV2Input {
  return {
    title: 'Bitcoin supererà 100.000 USD?',
    description: 'Previsione sul prezzo di Bitcoin.',
    closesAt: futureDate,
    resolutionSourceUrl: 'https://www.coingecko.com/en/coins/bitcoin',
    resolutionNotes: 'Check price on Coingecko',
    resolutionCriteriaYes: 'Prezzo Bitcoin >= 100000 USD su CoinGecko entro deadline',
    resolutionCriteriaNo: 'Prezzo Bitcoin < 100000 USD alla deadline',
    timezone: 'Europe/Rome',
    ...overrides,
  };
}

/** Minimal valid ImageBrief for tests */
function makeValidImageBrief(overrides?: Partial<ImageBrief>): ImageBrief {
  const base = 'Editorial photo of market event, cinematic lighting, no text, no logos, no watermarks. ';
  const alt = base.repeat(2).slice(0, 100); // ~100 chars
  return {
    subject_entities: ['Bitcoin'],
    scene_description: 'Abstract chart visualization',
    mood_tags: ['editorial', 'cinematic'],
    composition: 'centered',
    style_preset: 'market_chart_abstract',
    final_prompt: 'Editorial photo, no text, no logos, abstract chart',
    negative_prompt: 'text, logos, watermarks',
    alt_text: alt.padEnd(90, 'x'),
    ...overrides,
  };
}

describe('Rulebook v2 - Market rules', () => {
  describe('checkBinaryOutcomes', () => {
    it('PASS: both resolutionCriteriaYes and resolutionCriteriaNo present', () => {
      expect(checkBinaryOutcomes(makeInput())).toBeNull();
    });

    it('FAIL: missing resolutionCriteriaYes', () => {
      const err = checkBinaryOutcomes(makeInput({ resolutionCriteriaYes: '' }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('MISSING_BINARY_OUTCOMES');
      expect(err?.severity).toBe('BLOCK');
    });

    it('FAIL: missing resolutionCriteriaNo', () => {
      const err = checkBinaryOutcomes(makeInput({ resolutionCriteriaNo: '' }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('MISSING_BINARY_OUTCOMES');
    });
  });

  describe('checkDeadline', () => {
    it('PASS: valid future closesAt', () => {
      expect(checkDeadline(makeInput())).toBeNull();
    });

    it('FAIL: missing closesAt', () => {
      const err = checkDeadline(makeInput({ closesAt: '' }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('MISSING_DEADLINE');
    });

    it('FAIL: closesAt in past', () => {
      const err = checkDeadline(makeInput({ closesAt: pastDate }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('MISSING_DEADLINE');
    });
  });

  describe('checkResolutionCriteria', () => {
    it('PASS: resolutionCriteriaYes and No present', () => {
      expect(checkResolutionCriteria(makeInput())).toBeNull();
    });

    it('FAIL: missing resolutionCriteriaYes', () => {
      const err = checkResolutionCriteria(makeInput({ resolutionCriteriaYes: '' }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('MISSING_RESOLUTION_CRITERIA');
    });
  });

  describe('checkResolutionSource', () => {
    it('PASS: valid URL', () => {
      expect(checkResolutionSource(makeInput())).toBeNull();
    });

    it('FAIL: missing URL', () => {
      const err = checkResolutionSource(makeInput({ resolutionSourceUrl: null }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('MISSING_RESOLUTION_SOURCE');
    });

    it('FAIL: invalid URL', () => {
      const err = checkResolutionSource(makeInput({ resolutionSourceUrl: 'not-a-url' }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('MISSING_RESOLUTION_SOURCE');
    });
  });

  describe('checkTimezone', () => {
    it('PASS: Europe/Rome', () => {
      expect(checkTimezone(makeInput({ timezone: 'Europe/Rome' }))).toBeNull();
    });

    it('PASS: timezone optional (null)', () => {
      expect(checkTimezone(makeInput({ timezone: null }))).toBeNull();
    });

    it('FAIL: invalid timezone', () => {
      const err = checkTimezone(makeInput({ timezone: 'America/New_York' }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('INVALID_TIMEZONE');
      expect(err?.message).toContain('Europe/Rome');
    });

    it('FAIL: UTC timezone', () => {
      const err = checkTimezone(makeInput({ timezone: 'UTC' }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('INVALID_TIMEZONE');
    });
  });

  describe('checkTitleVsCriteria', () => {
    it('PASS: title key terms in criteria', () => {
      expect(
        checkTitleVsCriteria(
          makeInput({
            title: 'Bitcoin supererà 100.000 USD entro fine 2025?',
            resolutionCriteriaYes: 'Prezzo Bitcoin >= 100000 USD su CoinGecko',
            resolutionCriteriaNo: 'Prezzo Bitcoin < 100000 USD',
          })
        )
      ).toBeNull();
    });

    it('FAIL: title entity not in criteria', () => {
      const err = checkTitleVsCriteria(
        makeInput({
          title: 'Ethereum supererà 5000 USD?',
          resolutionCriteriaYes: 'Prezzo Bitcoin >= 100000 USD',
          resolutionCriteriaNo: 'Prezzo Bitcoin < 100000 USD',
        })
      );
      expect(err).toBeTruthy();
      expect(err?.code).toBe('TITLE_CRITERIA_MISMATCH');
    });

    it('PASS: generic semantic + specific title when criteria include title reference (discovery-backed)', () => {
      // MDE DeterministicOutcomeGenerator uses generic semantic_definition; adapter appends " Riferimento: {title}."
      const title = 'Reported event: Bitcoin supererà 100k entro 2025?';
      const genericYes = 'Resolves true when the statement is satisfied.';
      const genericNo = 'Resolves false when the statement is not satisfied.';
      expect(
        checkTitleVsCriteria(
          makeInput({
            title,
            resolutionCriteriaYes: genericYes + ` Riferimento: ${title}.`,
            resolutionCriteriaNo: genericNo + ` Riferimento: ${title}.`,
          })
        )
      ).toBeNull();
    });
  });

  describe('checkSourceHierarchy', () => {
    it('PASS: valid secondary URL', () => {
      expect(
        checkSourceHierarchy(
          makeInput({ resolutionSourceSecondary: 'https://example.com/secondary' })
        )
      ).toBeNull();
    });

    it('FAIL: invalid secondary URL', () => {
      const err = checkSourceHierarchy(
        makeInput({ resolutionSourceSecondary: 'not-a-valid-url' })
      );
      expect(err).toBeTruthy();
      expect(err?.code).toBe('SOURCE_HIERARCHY_INVALID');
    });
  });

  describe('runRulebookV2Rules', () => {
    it('PASS: valid input returns empty errors', () => {
      const errors = runRulebookV2Rules(makeInput());
      expect(errors).toEqual([]);
    });

    it('FAIL: multiple BLOCK errors', () => {
      const errors = runRulebookV2Rules(
        makeInput({
          resolutionCriteriaYes: '',
          resolutionSourceUrl: null,
          timezone: 'UTC',
        })
      );
      expect(errors.length).toBeGreaterThanOrEqual(2);
      expect(errors.every((e) => e.severity === 'BLOCK')).toBe(true);
    });
  });
});

describe('Rulebook v2 - Image rules', () => {
  describe('checkImageExists', () => {
    it('PASS: brief present', () => {
      expect(checkImageExists(makeValidImageBrief(), true)).toBeNull();
    });

    it('FAIL: brief missing when required', () => {
      const err = checkImageExists(null, true);
      expect(err).toBeTruthy();
      expect(err?.code).toBe('IMAGE_MISSING');
    });
  });

  describe('checkImageAltText', () => {
    it('PASS: valid alt text length', () => {
      const brief = makeValidImageBrief({ alt_text: 'x'.repeat(95) });
      expect(checkImageAltText(brief)).toBeNull();
    });

    it('FAIL: alt text too short', () => {
      const err = checkImageAltText(makeValidImageBrief({ alt_text: 'short' }));
      expect(err).toBeTruthy();
      expect(err?.code).toBe('IMAGE_NO_ALT_TEXT');
    });
  });

  describe('checkImageNoNewClaims', () => {
    it('PASS: no outcome spoilers in prompt', () => {
      const brief = makeValidImageBrief({
        final_prompt: 'Editorial chart, no text',
        alt_text: 'x'.repeat(90),
      });
      expect(
        checkImageNoNewClaims(brief, 'Bitcoin 100k?', 'Bitcoin >= 100000 USD')
      ).toBeNull();
    });

    it('WARN: outcome spoiler in alt text', () => {
      const brief = makeValidImageBrief({
        alt_text: 'Bitcoin has already reached 100k. Chart showing success.'.padEnd(90, 'x'),
      });
      const err = checkImageNoNewClaims(
        brief,
        'Bitcoin 100k?',
        'Bitcoin >= 100000 USD'
      );
      expect(err).toBeTruthy();
      expect(err?.code).toBe('IMAGE_NEW_CLAIMS');
      expect(err?.severity).toBe('WARN');
    });
  });
});

describe('validateRulebookV2', () => {
  it('PASS: valid input', () => {
    const result = validateRulebookV2(makeInput());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('FAIL: BLOCK errors', () => {
    const result = validateRulebookV2(
      makeInput({
        resolutionCriteriaYes: '',
        resolutionSourceUrl: null,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.severity === 'BLOCK')).toBe(true);
  });

  it('PASS with needsReview: WARN errors only', () => {
    const brief = generateImageBrief(
      { title: 'Bitcoin 100k?', category: 'Crypto', description: 'Test' },
      'Bitcoin 100k?'
    );
    brief.alt_text = 'Bitcoin has already reached 100k. Chart success.'.padEnd(90, 'x');
    const result = validateRulebookV2(makeInput({ imageBrief: brief }), {
      validateImage: true,
    });
    expect(result.valid).toBe(true);
    expect(result.needsReview).toBe(true);
    expect(result.errors.some((e) => e.code === 'IMAGE_NEW_CLAIMS')).toBe(true);
  });
});

describe('validateCandidates - integration', () => {
  function makeCandidate(overrides?: Partial<Candidate>): Candidate {
    return {
      title: 'Bitcoin supererà 100.000 USD?',
      description: 'Previsione sul prezzo di Bitcoin.',
      category: 'Crypto',
      closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      resolutionAuthorityHost: 'www.coingecko.com',
      resolutionAuthorityType: 'REPUTABLE',
      resolutionCriteriaYes: 'Prezzo Bitcoin >= 100000 USD su CoinGecko entro deadline',
      resolutionCriteriaNo: 'Prezzo Bitcoin < 100000 USD alla deadline',
      sourceStorylineId: 'storyline-1',
      templateId: 'crypto-price',
      resolutionSourceUrl: 'https://www.coingecko.com/en/coins/bitcoin',
      timezone: 'Europe/Rome',
      ...overrides,
    };
  }

  it('PASS: valid candidate', () => {
    const result = validateCandidates([makeCandidate()]);
    expect(result.valid.length).toBe(1);
    expect(result.rejected.length).toBe(0);
    expect(result.valid[0].rulebookValid).toBe(true);
  });

  it('FAIL: missing resolutionCriteriaYes', () => {
    const result = validateCandidates([
      makeCandidate({ resolutionCriteriaYes: '' }),
    ]);
    expect(result.valid.length).toBe(0);
    expect(result.rejected.length).toBe(1);
    expect(result.rejected[0].reason).toContain('binary');
  });

  it('FAIL: invalid timezone', () => {
    const result = validateCandidates([
      makeCandidate({ timezone: 'America/New_York' }),
    ]);
    expect(result.valid.length).toBe(0);
    expect(result.rejected.length).toBe(1);
    expect(result.rejected[0].reason).toContain('Europe/Rome');
  });

  it('FAIL: title vs criteria mismatch', () => {
    const result = validateCandidates([
      makeCandidate({
        title: 'Ethereum supererà 5000 USD?',
        resolutionCriteriaYes: 'Prezzo Bitcoin >= 100000 USD',
        resolutionCriteriaNo: 'Prezzo Bitcoin < 100000 USD',
      }),
    ]);
    expect(result.valid.length).toBe(0);
    expect(result.rejected.length).toBe(1);
    expect(result.rejected[0].reason).toContain('match');
  });

  it('rejects short title via rulebook (TITLE_TOO_SHORT) regardless of MDE enforce', () => {
    delete process.env.MDE_ENFORCE_VALIDATION;

    const result = validateCandidates([
      makeCandidate({
        title: 'BTC 100k?',
        resolutionCriteriaYes: 'BTC 100k o superiore su CoinGecko entro deadline',
        resolutionCriteriaNo: 'BTC sotto 100k alla deadline',
      }),
    ]);

    expect(result.valid.length).toBe(0);
    expect(result.rejected.length).toBe(1);
    expect(result.rejected[0].reason).toContain('20 characters');
    expect(result.rejectionReasons.TITLE_TOO_SHORT).toBe(1);
  });

  it('blocks short title when enforce=true (same rulebook block)', () => {
    process.env.MDE_ENFORCE_VALIDATION = 'true';

    const result = validateCandidates([
      makeCandidate({
        title: 'BTC 100k?',
        resolutionCriteriaYes: 'BTC 100k o superiore su CoinGecko entro deadline',
        resolutionCriteriaNo: 'BTC sotto 100k alla deadline',
      }),
    ]);

    expect(result.valid.length).toBe(0);
    expect(result.rejected.length).toBe(1);
    expect(result.rejected[0].reason).toContain('20 characters');
    expect(result.rejectionReasons.TITLE_TOO_SHORT).toBe(1);
  });
});
