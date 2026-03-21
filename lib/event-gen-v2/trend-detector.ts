/**
 * Trend Detector - Wrapper over storyline-engine
 * Selects eligible storylines (clusters) for event generation.
 * When TREND_RADAR_V2=true, uses Trend Detection Engine to reorder storylines by trend_score.
 */

import type { PrismaClient } from '@prisma/client';
import {
  getEligibleStorylines,
  type EligibleStoryline,
  type GetEligibleStorylinesParams,
  type GetEligibleStorylinesResult,
} from '../storyline-engine';
import type { TrendSignal } from './types';

const TREND_RADAR_V2 = process.env.TREND_RADAR_V2 === 'true';

/**
 * Maps EligibleStoryline to TrendSignal (same shape, different naming)
 */
function toTrendSignal(s: EligibleStoryline): TrendSignal {
  return {
    clusterId: s.clusterId,
    momentum: s.momentum,
    novelty: s.novelty,
    authorityType: s.authorityType,
    authorityHost: s.authorityHost,
    articleCount: s.articleCount,
  };
}

/** Normalize topic for matching */
function normalizeTopic(t: string): string {
  return t.toLowerCase().trim().replace(/\s+/g, ' ').slice(0, 100);
}

/**
 * When TREND_RADAR_V2=true, reorder storylines by trend_score from Trend Detection Engine.
 * Matches storyline topics (from cluster) to trend topics and boosts ordering.
 */
async function reorderByTrendRadar(
  eligible: EligibleStoryline[],
  prisma: PrismaClient
): Promise<EligibleStoryline[]> {
  try {
    const { getTrends } = await import('../trend-detection');
    const { trends } = await getTrends({ limit: 100, skipCache: false });

    if (trends.length === 0) return eligible;

    const trendByTopic = new Map<string, number>();
    for (const t of trends) {
      trendByTopic.set(normalizeTopic(t.topic), t.trend_score);
    }

    const scored = await Promise.all(
      eligible.map(async (s) => {
        const cluster = await prisma.sourceCluster.findUnique({
          where: { id: s.clusterId },
          include: { articles: { take: 3 } },
        });
        const titles = cluster?.articles.map((a) => a.title) ?? [];
        const topic = titles[0] ?? s.clusterId;
        const key = normalizeTopic(topic);
        let trendScore = 0;
        for (const [k, v] of trendByTopic) {
          if (key.includes(k) || k.includes(key)) {
            trendScore = Math.max(trendScore, v);
          }
        }
        const combined = s.momentum * 0.6 + trendScore * 100 * 0.4;
        return { storyline: s, combined };
      })
    );

    scored.sort((a, b) => b.combined - a.combined);
    return scored.map((x) => x.storyline);
  } catch (err) {
    console.warn('[Trend Detector] Trend Radar reorder failed, using default order:', err);
    return eligible;
  }
}

export async function getTrendSignals(
  params: GetEligibleStorylinesParams
): Promise<{
  signals: TrendSignal[];
  clustersLoadedCount: number;
  exclusionReasons: Record<string, number>;
}> {
  const result = await getEligibleStorylines(params);
  let eligible = result.eligible;

  if (TREND_RADAR_V2 && eligible.length > 0) {
    eligible = await reorderByTrendRadar(eligible, params.prisma);
  }

  return {
    signals: eligible.map(toTrendSignal),
    clustersLoadedCount: result.clustersLoadedCount,
    exclusionReasons: result.exclusionReasons,
  };
}

export { getEligibleStorylines, type EligibleStoryline, type GetEligibleStorylinesParams, type GetEligibleStorylinesResult };
