/**
 * Rulebook Validator - Wires lib/validator + pipeline/validation + rulebook v2
 * Filters out hard-fail candidates; optionally flags needs-review
 */

import { validateMarket } from '../validator/validator';
import { validateEvent } from '../pipeline/validation';
import type { Candidate, ValidatedCandidate } from './types';
import type { MarketValidationInput } from '../validator/types';
import type { RulebookV2Input } from './rulebook-validator/types';
import { EdgeCasePolicyRef } from './edge-case-policy';
import { validateRulebookV2 } from './rulebook-validator/validator';
import { toCandidateDraftContract } from '../integration/adapters/candidate-submission-adapter';
import { validateAgainstMdeContract } from '../integration/adapters/market-design-shadow-validator';

export interface RulebookValidationResult {
  valid: ValidatedCandidate[];
  rejected: Array<{ candidate: Candidate; reason: string }>;
  rejectionReasons: Record<string, number>;
}

/**
 * Converts Candidate to MarketValidationInput for legacy validator
 */
function toMarketValidationInput(c: Candidate): MarketValidationInput {
  return {
    title: c.title,
    description: c.description ?? null,
    closesAt: c.closesAt.toISOString(),
    resolutionSourceUrl: c.resolutionSourceUrl ?? `https://${c.resolutionAuthorityHost}/`,
    resolutionNotes: null,
  };
}

/**
 * Converts Candidate to RulebookV2Input for v2 rules
 */
function toRulebookV2Input(c: Candidate): RulebookV2Input {
  const candidateWithSources = c as Candidate & {
    resolutionSourceSecondary?: string | null;
    resolutionSourceTertiary?: string | null;
    outcomes?: unknown;
  };
  return {
    title: c.title,
    description: c.description ?? null,
    closesAt: c.closesAt.toISOString(),
    resolutionSourceUrl: c.resolutionSourceUrl ?? `https://${c.resolutionAuthorityHost}/`,
    resolutionNotes: null,
    resolutionCriteriaYes: c.resolutionCriteriaYes,
    resolutionCriteriaNo: c.resolutionCriteriaNo,
    resolutionCriteriaFull: c.resolutionCriteriaFull ?? null,
    timezone: c.timezone ?? null,
    resolutionSourceSecondary: candidateWithSources.resolutionSourceSecondary ?? null,
    resolutionSourceTertiary: candidateWithSources.resolutionSourceTertiary ?? null,
    marketType: c.marketType ?? null,
    outcomes: candidateWithSources.outcomes ?? null,
    templateId: c.templateId ?? null,
  };
}

/**
 * Runs rulebook validation on candidates.
 * Uses rulebook v2 rules first (binary, timezone, title-criteria, source hierarchy),
 * then legacy validateMarket (ambiguous, domain, non-binary, time), then pipeline validateEvent.
 * Hard-fail: reject. Needs-review: pass but flag for logging.
 */
export function validateCandidates(candidates: Candidate[]): RulebookValidationResult {
  const valid: ValidatedCandidate[] = [];
  const rejected: Array<{ candidate: Candidate; reason: string }> = [];
  const rejectionReasons: Record<string, number> = {};

  for (const candidate of candidates) {
    // Step 1: Rulebook v2 rules
    const v2Input = toRulebookV2Input(candidate);
    const v2Result = validateRulebookV2(v2Input, { validateImage: false });

    if (!v2Result.valid) {
      const firstError = v2Result.errors[0];
      const reason = firstError?.message ?? firstError?.code ?? 'RULEBOOK_V2_BLOCK';
      rejected.push({ candidate, reason });
      const key = firstError?.code ?? reason.slice(0, 50);
      rejectionReasons[key] = (rejectionReasons[key] ?? 0) + 1;
      continue;
    }

    const isSportFixture =
      (candidate.templateId ?? '') === 'sport-football-fixture' ||
      (candidate.templateId ?? '').startsWith('sport-football-');
    const isMultiOutcomeMarket = !!(
      candidate.marketType &&
      ['MULTIPLE_CHOICE', 'RANGE', 'TIME_TO_EVENT', 'COUNT_VOLUME', 'RANKING'].includes(candidate.marketType)
    );

    // Step 2: Legacy market validator (skip for multi-outcome: legacy rulebook rejects non-binary by design)
    let rulebookResult = { valid: true, needsReview: false, reasons: [] as string[] };
    if (!isMultiOutcomeMarket) {
      const input = toMarketValidationInput(candidate);
      rulebookResult = validateMarket(
        input,
        isSportFixture ? { minHoursFromNow: 1 } : undefined
      );
    }

    if (!rulebookResult.valid) {
      const reason = rulebookResult.reasons[0] ?? 'RULEBOOK_HARD_FAIL';
      rejected.push({ candidate, reason });
      const key = reason.slice(0, 50);
      rejectionReasons[key] = (rejectionReasons[key] ?? 0) + 1;
      continue;
    }

    // Step 3: Pipeline event validation (sport: saltata, già validato da rulebook v2)
    if (!isSportFixture) {
      const pipelineResult = validateEvent(
        {
          title: candidate.title,
          description: candidate.description,
          category: candidate.category,
          closesAt: candidate.closesAt,
          createdById: 'system', // placeholder for validation
          b: 10,
        },
        new Date()
      );

      if (!pipelineResult.isValid) {
        const reason = pipelineResult.errors[0] ?? 'PIPELINE_VALIDATION_FAIL';
        rejected.push({ candidate, reason });
        const key = reason.slice(0, 50);
        rejectionReasons[key] = (rejectionReasons[key] ?? 0) + 1;
        continue;
      }
    }

    // Step 4: MDE progressive bridge (shadow by default, enforce via env)
    const mdeDraft = toCandidateDraftContract({
      title: candidate.title,
      description: candidate.description ?? null,
      category: candidate.category,
      closesAt: candidate.closesAt,
      resolutionSource: candidate.resolutionSourceUrl ?? null,
    });
    const mdeShadow = validateAgainstMdeContract(mdeDraft);
    if (!mdeShadow.valid) {
      const reason = mdeShadow.reason ?? 'MDE_SHADOW_VALIDATION_FAIL';
      const key = reason.slice(0, 50);
      rejectionReasons[key] = (rejectionReasons[key] ?? 0) + 1;
      if (process.env.MDE_ENFORCE_VALIDATION === 'true') {
        rejected.push({ candidate, reason });
        continue;
      }
    }

    valid.push({
      ...candidate,
      rulebookValid: true as const,
      needsReview: rulebookResult.needsReview || v2Result.needsReview,
      edgeCasePolicyRef:
        rulebookResult.needsReview || v2Result.needsReview
          ? EdgeCasePolicyRef.AMBIGUOUS
          : EdgeCasePolicyRef.DEFAULT,
    });
  }

  return { valid, rejected, rejectionReasons };
}
