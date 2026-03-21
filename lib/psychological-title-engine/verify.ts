/**
 * Psychological Title Engine - Resolution criteria verification
 * Ensures the generated title aligns with deterministic resolution.
 */

import type { StructuredCandidateEvent } from '../candidate-event-templates/types';
import { validateMarket } from '../validator/validator';

/** Check if title mentions the entity */
function hasEntityAlignment(title: string, entity: string): boolean {
  if (!entity?.trim()) return true;
  return title.toLowerCase().includes(entity.toLowerCase().trim());
}

/** Check if title mentions threshold (number or string) */
function hasThresholdAlignment(title: string, threshold: string | number): boolean {
  if (threshold === null || threshold === undefined) return true;
  const str = String(threshold);
  if (str.trim() === '') return true;
  if (typeof threshold === 'number') {
    const itLocale = threshold.toLocaleString('it-IT');
    return (
      title.includes(String(threshold)) ||
      title.includes(itLocale) ||
      title.includes(threshold.toLocaleString()) ||
      (threshold >= 1000 && title.toLowerCase().includes(`${threshold / 1000}k`)) ||
      (threshold >= 1_000_000 && title.toLowerCase().includes(`${threshold / 1_000_000}m`)) ||
      (threshold >= 1_000_000_000 && title.toLowerCase().includes(`${threshold / 1_000_000_000}b`))
    );
  }
  return title.toLowerCase().includes(str.toLowerCase().trim());
}

/** Check if title has a deadline cue (italiano: "prima del", "entro il", mesi) */
function hasDeadlineCue(title: string): boolean {
  const lower = title.toLowerCase();
  if (lower.includes('prima del ') || lower.includes('entro il ') || lower.includes('entro ')) return true;
  if (lower.includes('before ') || lower.includes('by ')) return true;
  const monthPattern =
    /\b(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic|gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|jan|feb|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i;
  if (monthPattern.test(title)) return true;
  if (/\bq[1-4]\s*\d{4}\b/i.test(title)) return true;
  return false;
}

/**
 * Verify that a title aligns with resolution criteria and passes rulebook validation.
 */
export function verifyTitleForResolution(
  title: string,
  candidate: StructuredCandidateEvent
): { ok: boolean; reason?: string } {
  if (!hasEntityAlignment(title, candidate.subject_entity)) {
    return { ok: false, reason: 'Title does not mention entity' };
  }

  if (!hasThresholdAlignment(title, candidate.threshold)) {
    return { ok: false, reason: 'Title does not mention threshold' };
  }

  if (!hasDeadlineCue(title)) {
    return { ok: false, reason: 'Title missing deadline cue' };
  }

  const resolutionUrl = candidate.resolution_sources[0] ?? '';
  const resolutionSourceUrl =
    resolutionUrl && resolutionUrl.startsWith('http')
      ? resolutionUrl
      : `https://${resolutionUrl || 'example.com'}/`;

  const validationInput = {
    title,
    description: candidate.templateId,
    closesAt: candidate.deadline.toISOString(),
    resolutionSourceUrl,
    resolutionNotes: candidate.resolutionCriteriaYes,
  };

  const result = validateMarket(validationInput);

  if (!result.valid) {
    return {
      ok: false,
      reason: result.reasons[0] ?? 'Rulebook validation failed',
    };
  }

  return { ok: true };
}
