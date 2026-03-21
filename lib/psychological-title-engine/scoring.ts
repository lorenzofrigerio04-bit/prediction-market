/**
 * Psychological Title Engine - Title scoring algorithm
 * Scores titles by clarity, tension, and brevity.
 */

import type { StructuredCandidateEvent } from '../candidate-event-templates/types';
import type { TitleScore } from './types';
import { containsBlockedWord, usesTensionVerb } from './vocabulary';

const DEFAULT_WEIGHTS = {
  clarity: 0.4,
  tension: 0.35,
  brevity: 0.25,
};

const LENGTH_TARGET_MIN = 50;
const LENGTH_TARGET_MAX = 90;
const LENGTH_HARD_MAX = 110;

/** Single condition check - no "and", "or", " e ", " oppure ", ";" */
function hasSingleCondition(title: string): boolean {
  const lower = title.toLowerCase();
  if (lower.includes(' and ') || lower.includes(' or ') || lower.includes(' e ') || lower.includes(' oppure ') || lower.includes(';')) {
    return false;
  }
  return true;
}

/** Check if title contains entity (case-insensitive substring) */
function containsEntity(title: string, entity: string): boolean {
  if (!entity || !entity.trim()) return false;
  return title.toLowerCase().includes(entity.toLowerCase().trim());
}

/** Check if title contains threshold (number or string) */
function containsThreshold(title: string, threshold: string | number): boolean {
  if (threshold === null || threshold === undefined) return true; // No threshold required
  const str = String(threshold);
  if (str.trim() === '') return true;
  // For numbers, check numeric representation (100000, 100.000 it-IT, 100k, etc.)
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

/** Compute brevity score: 1 in [50,90], 0.5 in (90,110], 0 above 110 */
function brevityScore(length: number): number {
  if (length > LENGTH_HARD_MAX) return 0;
  if (length >= LENGTH_TARGET_MIN && length <= LENGTH_TARGET_MAX) return 1;
  if (length > LENGTH_TARGET_MAX && length <= LENGTH_HARD_MAX) return 0.5;
  if (length < LENGTH_TARGET_MIN) return Math.max(0, 0.5 * (length / LENGTH_TARGET_MIN)); // Partial for short
  return 0;
}

/**
 * Score a title variant against a candidate.
 */
export function scoreTitle(
  title: string,
  candidate: StructuredCandidateEvent,
  weights = DEFAULT_WEIGHTS
): TitleScore {
  const details: TitleScore['details'] = {};

  // Single condition: hard fail
  const singleCondition = hasSingleCondition(title);
  details.singleCondition = singleCondition;
  if (!singleCondition) {
    return {
      clarity: 0,
      tension: 0,
      brevity: 0,
      combined: 0,
      details,
    };
  }

  // Clarity sub-scores (0.25 each)
  const hasEntity = containsEntity(title, candidate.subject_entity);
  details.hasEntity = hasEntity;

  const hasThreshold = containsThreshold(title, candidate.threshold);
  details.hasThreshold = hasThreshold;

  const hasDeadline = hasDeadlineCue(title);
  details.hasDeadline = hasDeadline;

  const noBlockedWords = !containsBlockedWord(title);
  details.noBlockedWords = noBlockedWords;

  const clarity =
    (hasEntity ? 0.25 : 0) +
    (hasThreshold ? 0.25 : 0) +
    (hasDeadline ? 0.25 : 0) +
    (noBlockedWords ? 0.25 : 0);

  // Tension sub-scores (0.5 each)
  const usesTension = usesTensionVerb(title);
  details.usesTensionVerb = usesTension;

  const endsWithQuestion = title.trim().endsWith('?');
  details.endsWithQuestion = endsWithQuestion;

  const tension = (usesTension ? 0.5 : 0) + (endsWithQuestion ? 0.5 : 0);

  // Brevity
  const length = title.length;
  details.length = length;
  const brevity = brevityScore(length);

  const combined =
    weights.clarity * clarity + weights.tension * tension + weights.brevity * brevity;

  return {
    clarity,
    tension,
    brevity,
    combined,
    details,
  };
}
