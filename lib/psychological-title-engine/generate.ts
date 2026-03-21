/**
 * Psychological Title Engine - Generazione varianti e selezione (ITALIANO)
 */

import type { StructuredCandidateEvent } from '../candidate-event-templates/types';
import type { TitleVariant, ScoredVariant } from './types';
import { getPatternsForTemplate } from './pattern-library';
import { scoreTitle } from './scoring';
import { verifyTitleForResolution } from './verify';

/** Mesi in italiano (abbreviati per brevità) */
const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

/** Formatta la soglia per il titolo (formato italiano) */
function formatThreshold(threshold: string | number, templateId: string): string {
  if (typeof threshold === 'number') {
    if (threshold >= 1_000_000_000) {
      return `${(threshold / 1_000_000_000).toLocaleString('it-IT')}B USD`;
    }
    if (threshold >= 1_000_000) {
      return `${(threshold / 1_000_000).toLocaleString('it-IT')}M USD`;
    }
    if (threshold >= 1000) {
      return `${(threshold / 1000).toLocaleString('it-IT')}k USD`;
    }
    if (String(threshold).includes('.') || templateId.includes('cpi') || templateId.includes('economy')) {
      return `${threshold}%`;
    }
    return `${threshold} USD`;
  }
  return String(threshold);
}

/** Formatta la deadline in formato breve italiano (es. "15 mar", "1 apr") */
function formatDate(deadline: Date): string {
  const d = new Date(deadline);
  const mese = MESI[d.getMonth()];
  const giorno = d.getDate();
  return `${giorno} ${mese}`;
}

/** Compila i placeholder del pattern con i dati del candidato */
function fillPattern(
  template: string,
  placeholders: string[],
  candidate: StructuredCandidateEvent
): string {
  const entity = candidate.subject_entity;
  const threshold = formatThreshold(candidate.threshold, candidate.templateId);
  const date = formatDate(candidate.deadline);

  let result = template;
  result = result.replace(/\[ENTITY\]/g, entity);
  result = result.replace(/\[THRESHOLD\]/g, threshold);
  result = result.replace(/\[DATE\]/g, date);
  result = result.replace(/\[TOURNAMENT\]/g, String(candidate.threshold));
  result = result.replace(/\[PRODUCT\]/g, String(candidate.threshold));
  result = result.replace(/\[METRIC\]/g, 'raggiungere');
  return result;
}

/** Genera varianti di titolo dai pattern */
function generateVariants(candidate: StructuredCandidateEvent): TitleVariant[] {
  const patterns = getPatternsForTemplate(candidate.templateId);
  const variants: TitleVariant[] = [];

  for (const pattern of patterns) {
    const title = fillPattern(pattern.template, pattern.placeholders, candidate);
    if (title.length <= 110) {
      variants.push({ title, patternId: pattern.id });
    }
  }

  return variants;
}

/**
 * Genera il miglior titolo psicologico per un candidato.
 * Restituisce il titolo ottimizzato o null per usare l'originale.
 */
export function generatePsychologicalTitle(
  candidate: StructuredCandidateEvent
): string | null {
  const variants = generateVariants(candidate);

  if (variants.length === 0) {
    return null;
  }

  const scored: ScoredVariant[] = variants.map((v) => ({
    ...v,
    score: scoreTitle(v.title, candidate),
  }));

  const sorted = scored
    .filter((s) => s.score.combined > 0)
    .sort((a, b) => b.score.combined - a.score.combined);

  if (sorted.length === 0) {
    return null;
  }

  const best = sorted[0];
  const verification = verifyTitleForResolution(best.title, candidate);

  if (!verification.ok) {
    return null;
  }

  return best.title;
}
