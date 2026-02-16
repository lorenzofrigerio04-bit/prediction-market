/**
 * Deterministic validation rules for markets.
 * Hard fail: reject immediately. Needs review: flag for admin approval.
 */

import { parseOutcomeDateFromText } from "../event-generation/closes-at";
import type { MarketValidationInput } from "./types";

/** Config for allowed/blocked domains and time bounds. */
export type ValidatorRulesConfig = {
  /** If non-empty, only these hostnames are allowed for resolutionSourceUrl. */
  domainWhitelist: string[];
  /** These hostnames are always rejected. */
  domainBlacklist: string[];
  /** Minimum hours from now for closesAt to be valid. */
  minHoursFromNow: number;
  /** Max days from now for closesAt (too-far future = hard fail). */
  maxHorizonDays: number;
  /** Max ms difference between closesAt and parsed outcome date to consider coherent. */
  timeCoherenceToleranceMs: number;
};

export const DEFAULT_VALIDATOR_CONFIG: ValidatorRulesConfig = {
  domainWhitelist: [],
  domainBlacklist: [
    "example.com",
    "test.com",
    "localhost",
    "clickbait.example",
  ],
  minHoursFromNow: 24,
  maxHorizonDays: 730,
  timeCoherenceToleranceMs: 48 * 60 * 60 * 1000, // 48h
};

// --- Helpers ---

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isDomainAllowed(
  url: string,
  config: Pick<ValidatorRulesConfig, "domainWhitelist" | "domainBlacklist">
): boolean {
  const host = getHostname(url);
  if (!host) return false;
  if (config.domainBlacklist.some((d) => host === d || host.endsWith("." + d))) return false;
  if (config.domainWhitelist.length > 0) {
    if (!config.domainWhitelist.some((d) => host === d || host.endsWith("." + d))) return false;
  }
  return true;
}

// --- Hard fail: ambiguous wording ---

/** Words/phrases that make the question ambiguous (hard fail). */
const AMBIGUOUS_WORD_PATTERNS = [
  /\bmight\b/i,
  /\bcould\b/i,
  /\bmay\b(?!\s+(?:the|I|we|they))/i, // avoid "May the force"
  /\bperhaps\b/i,
  /\bpossibly\b/i,
  /\bpotentially\b/i,
  /\bunclear\b/i,
  /\buncertain\b/i,
  /\bpotrebbe\b/i,
  /\bforse\b/i,
  /\bsi dice\b/i,
  /\bsembra\b/i,
  /\bipotesi\b/i,
  /\bincerto\b/i,
  /\bchissà\b/i,
];

export function checkAmbiguousWording(input: MarketValidationInput): string | null {
  const text = [input.title, input.description].filter(Boolean).join(" ");
  if (!text.trim()) return null;
  const lower = text.toLowerCase();
  for (const re of AMBIGUOUS_WORD_PATTERNS) {
    if (re.test(lower)) {
      return `Ambiguous wording: question contains uncertain language (e.g. "might", "could", "forse") that makes resolution unclear`;
    }
  }
  return null;
}

// --- Hard fail: missing resolution source ---

export function checkMissingResolutionSource(input: MarketValidationInput): string | null {
  const url = input.resolutionSourceUrl;
  if (url == null || typeof url !== "string" || !url.trim()) {
    return "Missing resolution source: resolutionSourceUrl is required and must be a non-empty URL";
  }
  try {
    new URL(url.trim());
  } catch {
    return "Missing resolution source: resolutionSourceUrl must be a valid URL";
  }
  return null;
}

// --- Hard fail: resolution source domain not allowed ---

export function checkResolutionSourceDomain(
  input: MarketValidationInput,
  config: ValidatorRulesConfig
): string | null {
  const url = input.resolutionSourceUrl;
  if (url == null || typeof url !== "string" || !url.trim()) return null; // handled by checkMissingResolutionSource
  if (!isDomainAllowed(url, config)) {
    const host = getHostname(url);
    return `Resolution source domain not allowed: "${host}" is not an allowed source for resolution`;
  }
  return null;
}

// --- Hard fail: non-binary outcome ---

const NON_BINARY_PATTERNS = [
  /\bhow much\b/i,
  /\bhow many\b/i,
  /\bwho will win\b/i,
  /\bwhich (one|team|player)\b/i,
  /\bquanto\b/i,
  /\bquanti\b/i,
  /\bchi\s+vincer/i, // "chi vincerà", "chi vince"
  /\bchi vince\b/i,
  /\bquale\b/i,
  /\bquali\b/i,
  /\bwhen exactly\b/i,
  /\bin what way\b/i,
  /\bquando esattamente\b/i,
  /\bin che modo\b/i,
];

export function checkNonBinary(input: MarketValidationInput): string | null {
  const text = [input.title, input.description].filter(Boolean).join(" ");
  if (!text.trim()) return null;
  const lower = text.toLowerCase();
  for (const re of NON_BINARY_PATTERNS) {
    if (re.test(lower)) {
      return "Non-binary outcome: question suggests multiple or non-yes/no outcomes (e.g. 'how many', 'which one')";
    }
  }
  return null;
}

// --- Hard fail: time incoherence ---

export function checkTimeIncoherent(
  input: MarketValidationInput,
  config: ValidatorRulesConfig
): string | null {
  const closesAtStr = input.closesAt;
  if (!closesAtStr || typeof closesAtStr !== "string") return null;
  const closesAt = new Date(closesAtStr);
  if (Number.isNaN(closesAt.getTime())) return null;

  const text = [input.title, input.description].filter(Boolean).join(" ");
  const outcomeDate = parseOutcomeDateFromText(text);
  if (!outcomeDate) return null; // no date in text, skip coherence check

  const diff = Math.abs(closesAt.getTime() - outcomeDate.getTime());
  if (diff > config.timeCoherenceToleranceMs) {
    return `Time incoherence: closesAt (${closesAt.toISOString().slice(0, 16)}) does not align with event outcome date suggested in text (within ${config.timeCoherenceToleranceMs / (60 * 60 * 1000)}h)`;
  }
  return null;
}

// --- Hard fail: past event ---

export function checkPastEvent(
  input: MarketValidationInput,
  config: ValidatorRulesConfig
): string | null {
  const now = Date.now();
  const minClose = now + config.minHoursFromNow * 60 * 60 * 1000;

  const closesAtStr = input.closesAt;
  if (closesAtStr && typeof closesAtStr === "string") {
    const closesAt = new Date(closesAtStr);
    if (!Number.isNaN(closesAt.getTime()) && closesAt.getTime() < minClose) {
      return `Past event: closesAt (${closesAt.toISOString().slice(0, 16)}) is in the past or too soon (min ${config.minHoursFromNow}h from now)`;
    }
  }

  const text = [input.title, input.description].filter(Boolean).join(" ");
  const outcomeDate = parseOutcomeDateFromText(text);
  if (outcomeDate && outcomeDate.getTime() < now) {
    return `Past event: event outcome date inferred from text is in the past`;
  }
  return null;
}

// --- Hard fail: too far future ---

export function checkTooFarFuture(
  input: MarketValidationInput,
  config: ValidatorRulesConfig
): string | null {
  const now = Date.now();
  const maxHorizon = now + config.maxHorizonDays * 24 * 60 * 60 * 1000;

  const closesAtStr = input.closesAt;
  if (closesAtStr && typeof closesAtStr === "string") {
    const closesAt = new Date(closesAtStr);
    if (!Number.isNaN(closesAt.getTime()) && closesAt.getTime() > maxHorizon) {
      return `Too far future: closesAt is more than ${config.maxHorizonDays} days from now`;
    }
  }

  const text = [input.title, input.description].filter(Boolean).join(" ");
  const outcomeDate = parseOutcomeDateFromText(text);
  if (outcomeDate && outcomeDate.getTime() > maxHorizon) {
    return `Too far future: event outcome date inferred from text is more than ${config.maxHorizonDays} days from now`;
  }
  return null;
}

// --- Needs review: subjective interpretation ---

const SUBJECTIVE_PATTERNS = [
  /\bbetter\b/i,
  /\bbest\b/i,
  /\bworst\b/i,
  /\bsuccess\b/i,
  /\bfailure\b/i,
  /\bgood\b/i,
  /\bbad\b/i,
  /\bsignificant\b/i,
  /\bimportant\b/i,
  /\bmigliore\b/i,
  /\bpeggiore\b/i,
  /\bsuccesso\b/i,
  /\bfallimento\b/i,
];

export function checkSubjectiveInterpretation(input: MarketValidationInput): string | null {
  const text = [input.title, input.description].filter(Boolean).join(" ");
  if (!text.trim()) return null;
  for (const re of SUBJECTIVE_PATTERNS) {
    if (re.test(text)) {
      return "Subjective interpretation: wording may require subjective judgment to resolve";
    }
  }
  return null;
}

// --- Needs review: multiple outcomes ---

const MULTIPLE_OUTCOMES_PATTERNS = [
  /\b(?:one of|any of|either)\s+(?:several|many|multiple)\b/i,
  /\b(?:several|many|multiple)\s+options?\b/i,
  /\b(?:win|winning)\s+(?:or|and)\s+/i,
  /\b(?:vincere|vinca)\s+(?:o|e)\s+/i,
];

export function checkMultipleOutcomes(input: MarketValidationInput): string | null {
  const text = [input.title, input.description].filter(Boolean).join(" ");
  if (!text.trim()) return null;
  for (const re of MULTIPLE_OUTCOMES_PATTERNS) {
    if (re.test(text)) {
      return "Multiple outcomes: question may have more than two resolvable outcomes";
    }
  }
  return null;
}

// --- Needs review: source reliability uncertain ---

const UNCERTAIN_SOURCE_PATTERNS = [
  /blog\./i,
  /rumor/i,
  /rumour/i,
  /anonymous/i,
  /unconfirmed/i,
  /voci\s+di\s+corridoio/i,
  /secondo\s+fonti\s+non\s+ufficiali/i,
];

export function checkSourceReliabilityUncertain(
  input: MarketValidationInput
): string | null {
  const url = input.resolutionSourceUrl ?? "";
  const text = [url, input.title, input.description].filter(Boolean).join(" ");
  if (!text.trim()) return null;
  for (const re of UNCERTAIN_SOURCE_PATTERNS) {
    if (re.test(text)) {
      return "Source reliability uncertain: resolution source may not be authoritative";
    }
  }
  return null;
}

// --- Needs review: edge case timing ---

const EDGE_TIMING_PATTERNS = [
  /\bby end of (?:day|year)\b/i,
  /\bentro (?:la )?fine (?:del )?(?:giorno|anno)\b/i,
  /\bmidnight\b/i,
  /\bmezzanotte\b/i,
  /\bdeadline\s+(?:is )?today\b/i,
  /\bscadenza\s+(?:è )?oggi\b/i,
];

export function checkEdgeCaseTiming(input: MarketValidationInput): string | null {
  const text = [input.title, input.description].filter(Boolean).join(" ");
  if (!text.trim()) return null;
  for (const re of EDGE_TIMING_PATTERNS) {
    if (re.test(text)) {
      return "Edge case timing: resolution time may be ambiguous (e.g. end of day, midnight)";
    }
  }
  return null;
}

// --- Aggregators ---

/** All hard-fail rule runners. Return reason string or null if pass. */
export function runHardFailRules(
  input: MarketValidationInput,
  config: ValidatorRulesConfig
): string[] {
  const reasons: string[] = [];
  const checks = [
    () => checkAmbiguousWording(input),
    () => checkMissingResolutionSource(input),
    () => checkResolutionSourceDomain(input, config),
    () => checkNonBinary(input),
    () => checkTimeIncoherent(input, config),
    () => checkPastEvent(input, config),
    () => checkTooFarFuture(input, config),
  ];
  for (const run of checks) {
    const r = run();
    if (r) reasons.push(r);
  }
  return reasons;
}

/** All needs-review rule runners. Return reason strings. */
export function runNeedsReviewRules(
  input: MarketValidationInput
): string[] {
  const reasons: string[] = [];
  const checks = [
    () => checkSubjectiveInterpretation(input),
    () => checkMultipleOutcomes(input),
    () => checkSourceReliabilityUncertain(input),
    () => checkEdgeCaseTiming(input),
  ];
  for (const run of checks) {
    const r = run();
    if (r) reasons.push(r);
  }
  return reasons;
}
