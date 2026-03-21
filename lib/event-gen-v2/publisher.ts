/**
 * Publisher - v2 enhancements: marketId, sourceType=NEWS, resolution sources,
 * generation metadata, timezone
 */

import type { PrismaClient } from '@prisma/client';
import {
  publishSelected,
  computeDedupKey,
  dedupCandidates,
  selectCandidates,
  selectCandidatesWithInfo,
} from '../event-publishing';
import type { ScoredCandidate } from '../event-publishing/types';
import { MULTI_OPTION_MARKET_TYPES, deriveOutcomesFromTitle, isMarketTypeId } from '@/lib/market-types';
import { getNextMarketId } from './market-id';
import { generateImageBrief } from '../image-brief-engine';
import { checkImageCompliance } from './rulebook-validator/image-rules';
import {
  toPublishableCandidateContract,
  type LegacySelectedCandidate,
} from '../integration/adapters/publication-action-adapter';

/** Candidate with v2 fields (resolution sources, generation scores, marketType, footballDataMatchId, etc.) */
type CandidateWithV2 = ScoredCandidate & {
  resolutionSourceUrl?: string | null;
  resolutionSourceSecondary?: string | null;
  resolutionSourceTertiary?: string | null;
  resolutionCriteriaFull?: string | null;
  edgeCasePolicyRef?: string | null;
  marketType?: string | null;
  outcomes?: Array<{ key: string; label: string }> | null;
  footballDataMatchId?: number | null;
  creationMetadata?: Record<string, unknown> | null;
  generationScores?: {
    trend_score: number;
    psychological_score: number;
    clarity_score: number;
    resolution_score: number;
    novelty_score: number;
    image_score: number;
    overall_score: number;
  } | null;
};

/**
 * Maps scoreBreakdown to generationScores format
 */
function toGenerationScores(
  candidate: ScoredCandidate
): {
  trend_score: number;
  psychological_score: number;
  clarity_score: number;
  resolution_score: number;
  novelty_score: number;
  image_score: number;
  overall_score: number;
} {
  const q = candidate.qualityScores;
  const b = candidate.scoreBreakdown;
  const overall = candidate.overall_score ?? candidate.score / 100;
  return {
    trend_score: q?.trend_score ?? b.momentum / 100,
    psychological_score: q?.psychological_score ?? 0.5,
    clarity_score: q?.clarity_score ?? b.clarity / 100,
    resolution_score: q?.resolution_score ?? (b.authority === 100 ? 1 : b.authority === 60 ? 0.6 : 0),
    novelty_score: q?.novelty_score ?? b.novelty / 100,
    image_score: q?.image_score ?? 0.5,
    overall_score: overall,
  };
}

export interface PublishSelectedV2Options {
  /** When provided, events are created with this user as createdById (e.g. manual submission) */
  createdById?: string;
  /** sourceType saved on Event (default NEWS). Use 'SPORT' for sport-page-only events. */
  sourceType?: string;
}

/**
 * Publishes selected candidates with v2 fields: marketId, sourceType=NEWS,
 * resolution sources, generatorVersion, generationScores, timezone
 */
export async function publishSelectedV2(
  prisma: PrismaClient,
  selected: CandidateWithV2[],
  now: Date,
  options?: PublishSelectedV2Options
): Promise<{
  createdCount: number;
  skippedCount: number;
  reasonsCount: Record<string, number>;
  eventIds?: string[];
}> {
  const year = now.getFullYear();
  const createdById = options?.createdById;

  const sourceType = options?.sourceType ?? 'NEWS';
  return publishSelected(prisma, selected, now, {
    createdById,
    getV2Data: async (candidate, tx) => {
      const publishable = toPublishableCandidateContract(
        candidate as unknown as LegacySelectedCandidate
      );
      const marketId = await getNextMarketId(tx, year);
      const c = candidate as CandidateWithV2;
      const imageBrief = generateImageBrief(
        {
          title: publishable.title,
          category: publishable.category,
          description: publishable.description,
          templateId: candidate.templateId,
        },
        publishable.title
      );

      // Rulebook v2: validate image compliance (exists, alt text, no new claims). Sport: image non bloccante.
      const resolutionCriteria =
        c.resolutionCriteriaFull ??
        [c.resolutionCriteriaYes, c.resolutionCriteriaNo].filter(Boolean).join(' | ') ??
        '';
      const imageRequired = sourceType !== 'SPORT';
      const imageErrors = checkImageCompliance(
        imageBrief,
        publishable.title,
        resolutionCriteria,
        { required: imageRequired }
      );
      const blockErrors = imageErrors.filter((e) => e.severity === 'BLOCK');
      if (blockErrors.length > 0) {
        const err = new Error(blockErrors[0].message) as Error & { code?: string };
        err.code = 'IMAGE_VALIDATION_BLOCK';
        throw err;
      }

      return {
        marketId,
        sourceType,
        resolutionSourceUrl: c.resolutionSourceUrl ?? undefined,
        resolutionSourceSecondary: c.resolutionSourceSecondary ?? undefined,
        resolutionSourceTertiary: c.resolutionSourceTertiary ?? undefined,
        resolutionCriteria: c.resolutionCriteriaFull ?? undefined,
        edgeCasePolicyRef: c.edgeCasePolicyRef ?? undefined,
        generatorVersion: '2.0',
        generationScores: c.generationScores ?? toGenerationScores(candidate),
        creationMetadata: {
          created_by_pipeline: 'event-gen-v2',
          pipeline_version: '2.0',
          ...(c.marketType ? { market_type: c.marketType } : {}),
          ...(createdById ? { manual_submission: true as const } : {}),
          ...(c.sportLeague ? { sport_league: c.sportLeague } : {}),
          ...(c.creationMetadata ?? {}),
        },
        ...(c.marketType ? { marketType: c.marketType } : {}),
        ...(c.marketType &&
          isMarketTypeId(c.marketType) &&
          MULTI_OPTION_MARKET_TYPES.includes(c.marketType)
          ? (() => {
              if (Array.isArray(c.outcomes) && c.outcomes.length > 0) {
                return { outcomes: c.outcomes };
              }
              const derived = deriveOutcomesFromTitle(publishable.title);
              return derived.length > 0 ? { outcomes: derived } : {};
            })()
          : {}),
        timezone: 'Europe/Rome',
        imageBrief,
        ...(c.footballDataMatchId != null ? { footballDataMatchId: c.footballDataMatchId } : {}),
      };
    },
  });
}

export {
  computeDedupKey,
  dedupCandidates,
  selectCandidates,
  selectCandidatesWithInfo,
};
