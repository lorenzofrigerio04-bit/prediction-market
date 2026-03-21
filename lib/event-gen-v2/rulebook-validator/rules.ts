/**
 * Rulebook Validator v2 - Validation rules
 * Binary outcomes (or multi-outcome), timezone, title vs criteria, source hierarchy, title quality.
 */

import type { RulebookV2Input } from './types';
import type { RulebookError } from './error-schema';
import { RULEBOOK_ERROR_CODES } from './error-schema';
import { MULTI_OPTION_MARKET_TYPES, isMarketTypeId, parseOutcomesJson } from '@/lib/market-types';

const REQUIRED_TIMEZONE = 'Europe/Rome';

/** True when candidate is a multi-option market type (outcomes may be derived from title at publish) */
function isMultiOptionMarket(input: RulebookV2Input): boolean {
  const mt = input.marketType;
  return !!(mt && isMarketTypeId(mt) && MULTI_OPTION_MARKET_TYPES.includes(mt));
}

/** Check binary outcomes YES/NO exist (skip when market is multi-option) */
export function checkBinaryOutcomes(input: RulebookV2Input): RulebookError | null {
  if (isMultiOptionMarket(input)) return null;
  const yes = input.resolutionCriteriaYes?.trim();
  const no = input.resolutionCriteriaNo?.trim();
  if (!yes || !no) {
    return {
      code: RULEBOOK_ERROR_CODES.MISSING_BINARY_OUTCOMES,
      severity: 'BLOCK',
      message: 'Market must include binary outcomes: resolutionCriteriaYes and resolutionCriteriaNo are required (or use multi-outcome with outcomes/criteria)',
      field: !yes ? 'resolutionCriteriaYes' : 'resolutionCriteriaNo',
    };
  }
  return null;
}

const SPORT_FIXTURE_TEMPLATE_ID = 'sport-football-fixture';
const SPORT_FOOTBALL_TEMPLATE_PREFIX = 'sport-football-';

/** Per fixture sport (es. partite calcio) la chiusura è a fine partita: basta che sia nel futuro (≥ 1h). */
function isSportFixture(input: RulebookV2Input): boolean {
  const templateId = input.templateId ?? '';
  return (
    templateId === SPORT_FIXTURE_TEMPLATE_ID ||
    templateId.startsWith(SPORT_FOOTBALL_TEMPLATE_PREFIX)
  );
}

/** Check deadline (closesAt) is valid and in future */
export function checkDeadline(input: RulebookV2Input): RulebookError | null {
  const closesAtStr = input.closesAt;
  if (!closesAtStr || typeof closesAtStr !== 'string') {
    return {
      code: RULEBOOK_ERROR_CODES.MISSING_DEADLINE,
      severity: 'BLOCK',
      message: 'Deadline (closesAt) is required and must be a valid ISO 8601 date',
      field: 'closesAt',
    };
  }
  const closesAt = new Date(closesAtStr);
  if (Number.isNaN(closesAt.getTime())) {
    return {
      code: RULEBOOK_ERROR_CODES.MISSING_DEADLINE,
      severity: 'BLOCK',
      message: 'Deadline (closesAt) must be a valid date',
      field: 'closesAt',
    };
  }
  const now = Date.now();
  const minClose = isSportFixture(input)
    ? now + 60 * 60 * 1000
    : now + 24 * 60 * 60 * 1000; // sport: almeno 1h; altri: 24h
  if (closesAt.getTime() < minClose) {
    return {
      code: RULEBOOK_ERROR_CODES.MISSING_DEADLINE,
      severity: 'BLOCK',
      message: isSportFixture(input)
        ? 'Deadline (closesAt) must be at least 1h from now'
        : 'Deadline (closesAt) must be at least 24h from now',
      field: 'closesAt',
    };
  }
  return null;
}

/** Check resolution criteria is present (binary: Yes/No; multi-outcome: full or outcomes) */
export function checkResolutionCriteria(input: RulebookV2Input): RulebookError | null {
  const hasYes = !!input.resolutionCriteriaYes?.trim();
  const hasNo = !!input.resolutionCriteriaNo?.trim();
  const hasFull = !!input.resolutionCriteriaFull?.trim();
  const options = parseOutcomesJson(input.outcomes);
  const hasOutcomes = (options?.length ?? 0) > 0;

  if (isMultiOptionMarket(input)) {
    if (hasFull || hasOutcomes) return null;
    return {
      code: RULEBOOK_ERROR_CODES.MISSING_RESOLUTION_CRITERIA,
      severity: 'BLOCK',
      message: 'Multi-outcome market requires resolutionCriteriaFull or outcomes array',
      field: 'resolutionCriteriaFull',
    };
  }

  if (!hasYes && !hasFull) {
    return {
      code: RULEBOOK_ERROR_CODES.MISSING_RESOLUTION_CRITERIA,
      severity: 'BLOCK',
      message: 'Resolution criteria required: resolutionCriteriaYes or resolutionCriteriaFull must be present',
      field: 'resolutionCriteriaYes',
    };
  }
  if (!hasNo && !hasFull) {
    return {
      code: RULEBOOK_ERROR_CODES.MISSING_RESOLUTION_CRITERIA,
      severity: 'BLOCK',
      message: 'Resolution criteria required: resolutionCriteriaNo or resolutionCriteriaFull must be present',
      field: 'resolutionCriteriaNo',
    };
  }
  return null;
}

/** Check resolution source URL is valid */
export function checkResolutionSource(input: RulebookV2Input): RulebookError | null {
  const url = input.resolutionSourceUrl;
  if (url == null || typeof url !== 'string' || !url.trim()) {
    return {
      code: RULEBOOK_ERROR_CODES.MISSING_RESOLUTION_SOURCE,
      severity: 'BLOCK',
      message: 'Resolution source (resolutionSourceUrl) is required and must be a non-empty URL',
      field: 'resolutionSourceUrl',
    };
  }
  try {
    new URL(url.trim());
  } catch {
    return {
      code: RULEBOOK_ERROR_CODES.MISSING_RESOLUTION_SOURCE,
      severity: 'BLOCK',
      message: 'Resolution source (resolutionSourceUrl) must be a valid URL',
      field: 'resolutionSourceUrl',
    };
  }
  return null;
}

/** Check timezone is Europe/Rome when present */
export function checkTimezone(input: RulebookV2Input): RulebookError | null {
  const tz = input.timezone?.trim();
  if (!tz) return null; // optional, no check
  const normalized = tz.replace(/^\s+|\s+$/g, '');
  if (normalized.toLowerCase() !== REQUIRED_TIMEZONE.toLowerCase()) {
    return {
      code: RULEBOOK_ERROR_CODES.INVALID_TIMEZONE,
      severity: 'BLOCK',
      message: `Timezone must be ${REQUIRED_TIMEZONE} when specified`,
      field: 'timezone',
    };
  }
  return null;
}

/** Extract significant terms from text (entities, numbers) for alignment check */
function extractSignificantTerms(text: string): string[] {
  const lower = text.toLowerCase();
  const terms: string[] = [];

  // Numbers (including 100k, 1m, etc.)
  const numberMatches = text.match(/\d+(?:[.,]\d+)?[kmb]?/gi);
  if (numberMatches) {
    terms.push(...numberMatches.map((n) => n.toLowerCase()));
  }

  // Words that look like entities (capitalized, or 3+ chars that aren't common)
  const commonWords = new Set([
    'the', 'a', 'an', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'is', 'are', 'was', 'were',
    'il', 'la', 'lo', 'i', 'le', 'gli', 'un', 'una', 'di', 'da', 'in', 'su', 'per', 'con',
    'sarà', 'saranno', 'verrà', 'raggiungerà', 'supererà', 'entro', 'prima', 'fine',
  ]);

  const words = text.split(/\s+/).filter((w) => w.length >= 2);
  for (const w of words) {
    const clean = w.replace(/[^\w]/g, '').toLowerCase();
    if (clean.length >= 3 && !commonWords.has(clean)) {
      terms.push(clean);
    }
  }

  return [...new Set(terms)];
}

/** Check title key entities appear in resolution criteria. Skipped for sport fixtures (titolo "A vs B", criteri generici). */
export function checkTitleVsCriteria(input: RulebookV2Input): RulebookError | null {
  if (isSportFixture(input)) return null;

  const criteriaText = [
    input.resolutionCriteriaYes,
    input.resolutionCriteriaNo,
    input.resolutionCriteriaFull,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!criteriaText.trim()) return null;

  const titleTerms = extractSignificantTerms(input.title);
  if (titleTerms.length === 0) return null;

  // At least one significant term from title must appear in criteria
  const hasOverlap = titleTerms.some((term) => criteriaText.includes(term));
  if (!hasOverlap) {
    return {
      code: RULEBOOK_ERROR_CODES.TITLE_CRITERIA_MISMATCH,
      severity: 'BLOCK',
      message: `Title must match resolution logic: key terms from title (e.g. "${titleTerms[0]}") not found in resolution criteria`,
      field: 'title',
    };
  }

  // Check for entity contradiction: title "Ethereum" but criteria "Bitcoin" -> reject
  // Allow aliases: BTC/Bitcoin, ETH/Ethereum (same entity, different names)
  const entityGroups: RegExp[] = [
    /\b(bitcoin|btc)\b/i,
    /\b(ethereum|eth)\b/i,
    /\b(solana|sol)\b/i,
    /\b(inter|milan|juve|juventus|roma|napoli|atalanta)\b/i,
    /\b(apple|google|meta|microsoft|amazon|tesla)\b/i,
  ];

  const titleLower = input.title.toLowerCase();
  let titleGroupIdx = -1;
  let criteriaGroupIdx = -1;

  for (let i = 0; i < entityGroups.length; i++) {
    if (entityGroups[i].test(titleLower)) titleGroupIdx = i;
    if (entityGroups[i].test(criteriaText)) criteriaGroupIdx = i;
  }

  if (titleGroupIdx >= 0 && criteriaGroupIdx >= 0 && titleGroupIdx !== criteriaGroupIdx) {
    return {
      code: RULEBOOK_ERROR_CODES.TITLE_CRITERIA_MISMATCH,
      severity: 'BLOCK',
      message: `Title must match resolution logic: title and criteria mention different entities`,
      field: 'title',
    };
  }

  return null;
}

/** Check source hierarchy: primary required, secondary/tertiary valid URLs if present */
export function checkSourceHierarchy(input: RulebookV2Input): RulebookError | null {
  // Primary already checked by checkResolutionSource
  const primary = input.resolutionSourceUrl?.trim();
  if (!primary) return null; // handled elsewhere

  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const secondary = input.resolutionSourceSecondary?.trim();
  if (secondary && !isValidUrl(secondary)) {
    return {
      code: RULEBOOK_ERROR_CODES.SOURCE_HIERARCHY_INVALID,
      severity: 'BLOCK',
      message: 'Resolution source secondary must be a valid URL when present',
      field: 'resolutionSourceSecondary',
    };
  }

  const tertiary = input.resolutionSourceTertiary?.trim();
  if (tertiary && !isValidUrl(tertiary)) {
    return {
      code: RULEBOOK_ERROR_CODES.SOURCE_HIERARCHY_INVALID,
      severity: 'BLOCK',
      message: 'Resolution source tertiary must be a valid URL when present',
      field: 'resolutionSourceTertiary',
    };
  }

  return null;
}

/** Min title length to avoid nonsense or placeholder titles */
const MIN_TITLE_LENGTH = 20;
/** Sport fixture: titoli tipo "Team A vs Team B", lunghezza minima ridotta e non richiesta domanda */
const MIN_TITLE_LENGTH_SPORT = 8;
/** Title must look like a question (end with ? or contain ?) — not required for sport fixtures */
const QUESTION_MARK_REQUIRED = true;

/** Check title has minimum length and looks like a question (sport: solo lunghezza minima ridotta) */
export function checkTitleClarity(input: RulebookV2Input): RulebookError | null {
  const t = input.title?.trim() ?? '';
  const isSport = isSportFixture(input);
  const minLen = isSport ? MIN_TITLE_LENGTH_SPORT : MIN_TITLE_LENGTH;

  if (t.length < minLen) {
    return {
      code: RULEBOOK_ERROR_CODES.TITLE_TOO_SHORT,
      severity: 'BLOCK',
      message: `Title must be at least ${minLen} characters`,
      field: 'title',
    };
  }
  if (!isSport && QUESTION_MARK_REQUIRED && !t.includes('?')) {
    return {
      code: RULEBOOK_ERROR_CODES.TITLE_NOT_QUESTION,
      severity: 'BLOCK',
      message: 'Title must be a clear question (include "?")',
      field: 'title',
    };
  }
  const wordCount = t.split(/\s+/).filter(Boolean).length;
  const minWords = isSport ? 2 : 3;
  if (wordCount < minWords) {
    return {
      code: RULEBOOK_ERROR_CODES.TITLE_QUALITY,
      severity: 'BLOCK',
      message: `Title must contain at least ${minWords} words`,
      field: 'title',
    };
  }
  return null;
}

/** Run all v2 market rules, return BLOCK errors first */
export function runRulebookV2Rules(input: RulebookV2Input): RulebookError[] {
  const errors: RulebookError[] = [];
  const checks = [
    checkTitleClarity,
    checkBinaryOutcomes,
    checkDeadline,
    checkResolutionCriteria,
    checkResolutionSource,
    checkTimezone,
    checkTitleVsCriteria,
    checkSourceHierarchy,
  ];

  for (const check of checks) {
    const err = check(input);
    if (err) errors.push(err);
  }

  return errors;
}
