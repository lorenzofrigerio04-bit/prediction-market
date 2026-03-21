/**
 * Psychological Title Engine - Vocabolario consentito e bloccato (ITALIANO)
 * Per scoring e verifica, garantisce risoluzione deterministica.
 */

/** Verbi di tensione che creano titoli coinvolgenti e chiari */
export const ALLOWED_TENSION_VERBS = [
  'superare',
  'raggiungere',
  'scendere',
  'vincere',
  'conquistare',
  'rilasciare',
  'toccare',
  'conseguire',
  'conseguirà',
  'pubblicherà',
  'supererà',
  'raggiungerà',
  'vincerà',
  'conquisterà',
  'rilascerà',
  'toccherà',
] as const;

export type AllowedTensionVerb = (typeof ALLOWED_TENSION_VERBS)[number];

/**
 * Parole ambigue bloccate - introducono soggettività o risoluzione poco chiara.
 */
export const BLOCKED_WORDS = [
  // Dalla spec utente (traduzioni)
  'maggiore',
  'maggior',
  'successo',
  'successful',
  'migliorare',
  'improve',
  'crollo',
  'collapse',
  'dominante',
  'dominant',
  // Inglese (per titoli misti)
  'major',
  'successful',
  'improve',
  'collapse',
  'dominant',
  // Ambigue / incerte
  'might',
  'could',
  'perhaps',
  'possibly',
  'potentially',
  'unclear',
  'uncertain',
  'maybe',
  'probabile',
  'significativo',
  'importante',
  'shock',
  'risi',
  'scandalo',
  'caos',
  'potrebbe',
  'forse',
  'si dice',
  'sembra',
  'ipotesi',
  'incerto',
  'chissà',
] as const;

/** Verifica se il testo contiene parole bloccate (case-insensitive) */
export function containsBlockedWord(text: string): boolean {
  const lower = text.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    // Usa boundary che include caratteri accentati (à, è, etc.) per l'italiano
    const re = new RegExp(`(?:^|[^a-zA-Zàèéìòùáéíóú])${escapeRegex(word)}(?:[^a-zA-Zàèéìòùáéíóú]|$)`, 'i');
    if (re.test(lower)) return true;
  }
  if (/\bmay\b/i.test(lower)) {
    const afterMay = lower.replace(/^.*\bmay\b\s*/i, '');
    const monthMatch = /^(the|1|2|3|4|5|6|7|8|9|10|11|12|gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)/i;
    if (!monthMatch.test(afterMay.trim())) return true;
  }
  return false;
}

/** Verifica se il testo usa uno dei verbi di tensione consentiti */
export function usesTensionVerb(text: string): boolean {
  const lower = text.toLowerCase();
  return ALLOWED_TENSION_VERBS.some((verb) => {
    // Usa (^|\s) e (\s|$|?) per evitare problemi con \b e caratteri accentati (à, è, etc.)
    const re = new RegExp(`(?:^|[^a-zA-Zàèéìòùáéíóú])${escapeRegex(verb)}(?:[^a-zA-Zàèéìòùáéíóú]|$)`, 'i');
    return re.test(lower);
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
