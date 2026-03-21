import { describe, it, expect } from 'vitest';
import { containsBlockedWord, usesTensionVerb } from '../vocabulary';

describe('containsBlockedWord', () => {
  it('detects blocked words in Italian', () => {
    expect(containsBlockedWord('Questo è un evento maggiore')).toBe(true);
    expect(containsBlockedWord('Un lancio di successo')).toBe(true);
    expect(containsBlockedWord('Potrebbe succedere')).toBe(true);
    expect(containsBlockedWord('Forse forse')).toBe(true);
  });

  it('allows clean Italian text', () => {
    expect(containsBlockedWord('Riuscirà Bitcoin a superare 100k USD?')).toBe(false);
    expect(containsBlockedWord('Apple rilascerà iPhone entro il 15 mar?')).toBe(false);
  });

  it('uses word boundaries', () => {
    expect(containsBlockedWord('miglioramento')).toBe(false);
    expect(containsBlockedWord('migliorare il processo')).toBe(true);
  });
});

describe('usesTensionVerb', () => {
  it('detects allowed Italian tension verbs', () => {
    expect(usesTensionVerb('Bitcoin supererà 100k USD?')).toBe(true);
    expect(usesTensionVerb('Inter vincerà la partita?')).toBe(true);
    expect(usesTensionVerb('Apple rilascerà iPhone entro marzo?')).toBe(true);
    expect(usesTensionVerb('Il CPI raggiungerà 2.5%?')).toBe(true);
  });

  it('returns false for non-tension verbs', () => {
    expect(usesTensionVerb('Bitcoin arriverà a 100k?')).toBe(false);
    expect(usesTensionVerb('Qualcosa succederà?')).toBe(false);
  });
});
