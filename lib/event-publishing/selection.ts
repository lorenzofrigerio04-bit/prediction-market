/**
 * Selezione candidati con caps e target (BLOCCO 5)
 *
 * Seleziona candidati rispettando:
 * - TARGET_OPEN_EVENTS: numero target di eventi OPEN (default 12)
 * - maxNewPerRun: max nuovi per run (default 5)
 * - Quality gate: overall_score >= QUALITY_THRESHOLD (0.75); discovery-backed può usare soglia più bassa se ENABLE_DISCOVERY_RELAXED_SELECTION=true
 * - Diversity: rank_score = overall_score + alpha * diversity_bonus
 * - Category/duration caps da target mix
 *
 * Discovery-backed candidates: identificati da sourceStorylineId === DISCOVERY_SOURCE_STORYLINE_ID
 * (stesso valore usato in pipelineArtifactsToAppCandidate / discovery-backed-integration).
 */

/** Marker per candidati discovery-backed (MDE pipeline). Valori: "mde-pipeline" o "mde-pipeline:observationId". Usato per soglia rilassata e per caps (ogni observationId è un bucket storyline distinto). */
const DISCOVERY_SOURCE_STORYLINE_ID = 'mde-pipeline';

function isDiscoveryBackedCandidate(sourceStorylineId: string | undefined): boolean {
  return (
    sourceStorylineId === DISCOVERY_SOURCE_STORYLINE_ID ||
    (typeof sourceStorylineId === 'string' && sourceStorylineId.startsWith(`${DISCOVERY_SOURCE_STORYLINE_ID}:`))
  );
}

import type { PrismaClient } from '@prisma/client';
import type { ScoredCandidate } from './types';
import { QUALITY_THRESHOLD } from './scoring';
import {
  getTargetCategory,
  getDurationBucket,
  computeDiversityBonus,
  buildCategoryCounts,
  buildDurationCounts,
  getCategoryCap,
  type TargetCategory,
  type DurationBucket,
  DURATION_TARGET_PCT,
} from './diversity';

const TARGET_OPEN_EVENTS_DEFAULT = 30;
const TARGET_OPEN_EVENTS =
  parseInt(process.env.TARGET_OPEN_EVENTS || String(TARGET_OPEN_EVENTS_DEFAULT), 10) ||
  TARGET_OPEN_EVENTS_DEFAULT;
const MAX_NEW_PER_RUN_DEFAULT = 25;
const MAX_NEW_PER_RUN =
  parseInt(process.env.MAX_NEW_PER_RUN || String(MAX_NEW_PER_RUN_DEFAULT), 10) ||
  MAX_NEW_PER_RUN_DEFAULT;

/** Nessun limite per run: target e max = NO_LIMIT_CAP (genera tutti i candidati che passano i criteri). Disattivabile con GENERATION_USE_LIMITS=true. Lettura a runtime per test. */
function useLimits(): boolean {
  return process.env.GENERATION_USE_LIMITS === 'true';
}
const NO_LIMIT_CAP = 9999;
const DIVERSITY_WEIGHT =
  parseFloat(process.env.DIVERSITY_WEIGHT || '0.15');
const MAX_EVENTS_PER_STORYLINE = 1;
const UNIVERSAL_TEMPLATE_IDS = [
  'universal-v1',
  'universal-v2',
  'universal-v3',
  'universal-fallback',
];

const SELECT_DEBUG = process.env.PIPELINE_DEBUG === 'true';

const QUALITY_THRESHOLD_DISCOVERY_DEFAULT = 0.55;

/** Soglia discovery e flag letti a runtime (per test e per evitare cache a load-time). */
function getDiscoveryRelaxedConfig(): {
  enabled: boolean;
  discoveryThreshold: number;
} {
  const explicitRelaxed = process.env.ENABLE_DISCOVERY_RELAXED_SELECTION === 'true';
  const useDiscoveryPipeline = process.env.USE_DISCOVERY_BACKED_PIPELINE === 'true';
  const enabled = explicitRelaxed || useDiscoveryPipeline;
  const v = process.env.QUALITY_THRESHOLD_DISCOVERY;
  const n = v != null ? parseFloat(v) : NaN;
  const discoveryThreshold = Number.isNaN(n)
    ? QUALITY_THRESHOLD_DISCOVERY_DEFAULT
    : Math.max(0, Math.min(1, n));
  return { enabled, discoveryThreshold };
}

function getQualityThresholdForCandidate(
  c: ScoredCandidate,
  standardThreshold: number,
  discoveryRelaxed: boolean,
  discoveryThreshold: number
): number {
  if (discoveryRelaxed && isDiscoveryBackedCandidate(c.sourceStorylineId)) {
    return discoveryThreshold;
  }
  return standardThreshold;
}

/**
 * Conta eventi OPEN che il feed mostra (stesso filtro di /api/feed/home-unified):
 * status OPEN, closesAt > now, sourceType = NEWS.
 * Così il target è allineato a "quanti eventi vede l'utente" e non a eventi seed/altre fonti.
 */
async function countOpenEvents(prisma: PrismaClient, now: Date): Promise<number> {
  return prisma.event.count({
    where: {
      status: 'OPEN',
      closesAt: { gt: now },
      sourceType: 'NEWS',
    },
  });
}

/**
 * Fetch open NEWS events for diversity counts (stesso universo di countOpenEvents)
 */
async function getOpenEventsForDiversity(
  prisma: PrismaClient,
  now: Date
): Promise<Array<{ category: string; closesAt: Date }>> {
  return prisma.event.findMany({
    where: {
      status: 'OPEN',
      closesAt: { gt: now },
      sourceType: 'NEWS',
    },
    select: { category: true, closesAt: true },
  });
}

export interface SelectCandidatesInfo {
  selected: ScoredCandidate[];
  openEventsCount: number;
  targetOpenEvents: number;
  need: number;
  /** Set when selected.length === 0 so callers can diagnose 30→0 drop */
  zeroSelectedReason?: 'NEED_ZERO' | 'ALL_FAILED_QUALITY' | 'ALL_FILTERED_BY_CAPS';
}

export interface SelectCandidatesOptions {
  maxNewPerRun?: number;
}

/**
 * Seleziona candidati e restituisce info per audit (open, target, need)
 */
export async function selectCandidatesWithInfo(
  prisma: PrismaClient,
  candidates: ScoredCandidate[],
  now: Date,
  options?: SelectCandidatesOptions
): Promise<SelectCandidatesInfo> {
  const openEventsCount = await countOpenEvents(prisma, now);
  const targetOpenEvents = useLimits() ? TARGET_OPEN_EVENTS : NO_LIMIT_CAP;
  const rawNeed = Math.max(0, targetOpenEvents - openEventsCount);
  const maxNew = useLimits() ? (options?.maxNewPerRun ?? MAX_NEW_PER_RUN) : NO_LIMIT_CAP;
  const need = Math.min(rawNeed, maxNew);

  if (SELECT_DEBUG) {
    console.log(
      `[Selection] openEventsCount=${openEventsCount} target=${targetOpenEvents} need=${need} maxNewPerRun=${maxNew}`
    );
  }

  if (need === 0) {
    return {
      selected: [],
      openEventsCount,
      targetOpenEvents,
      need,
      zeroSelectedReason: 'NEED_ZERO',
    };
  }

  const { selected, zeroSelectedReason } = await selectCandidatesInternal(prisma, candidates, now, need);
  return { selected, openEventsCount, targetOpenEvents, need, zeroSelectedReason };
}

/**
 * Seleziona candidati rispettando caps e target
 */
export async function selectCandidates(
  prisma: PrismaClient,
  candidates: ScoredCandidate[],
  now: Date,
  options?: SelectCandidatesOptions
): Promise<ScoredCandidate[]> {
  const openEventsCount = await countOpenEvents(prisma, now);
  const targetOpenEvents = useLimits() ? TARGET_OPEN_EVENTS : NO_LIMIT_CAP;
  const rawNeed = Math.max(0, targetOpenEvents - openEventsCount);
  const maxNew = useLimits() ? (options?.maxNewPerRun ?? MAX_NEW_PER_RUN) : NO_LIMIT_CAP;
  const need = Math.min(rawNeed, maxNew);
  if (need === 0) return [];
  const { selected } = await selectCandidatesInternal(prisma, candidates, now, need, options);
  return selected;
}

function selectCandidatesInternal(
  prisma: PrismaClient,
  candidates: ScoredCandidate[],
  now: Date,
  need: number,
  _options?: SelectCandidatesOptions
): Promise<{ selected: ScoredCandidate[]; zeroSelectedReason?: SelectCandidatesInfo['zeroSelectedReason'] }> {
  return (async () => {
    const openEvents = await getOpenEventsForDiversity(prisma, now);
    const categoryCounts = buildCategoryCounts(openEvents);
    const durationCounts = buildDurationCounts(openEvents, now);
    const totalActive = openEvents.length;

    const standardThreshold = QUALITY_THRESHOLD;
    const { enabled: discoveryRelaxed, discoveryThreshold } = getDiscoveryRelaxedConfig();

    const passed = candidates.filter((c) => {
      const overall = c.overall_score ?? c.score / 100;
      const threshold = getQualityThresholdForCandidate(c, standardThreshold, discoveryRelaxed, discoveryThreshold);
      return overall >= threshold;
    });

    if (SELECT_DEBUG && candidates.length > 0) {
      const sample = Math.min(3, candidates.length);
      for (let i = 0; i < sample; i++) {
        const c = candidates[i]!;
        const overall = c.overall_score ?? c.score / 100;
        const threshold = getQualityThresholdForCandidate(c, standardThreshold, discoveryRelaxed, discoveryThreshold);
        const passedQ = overall >= threshold;
        console.log(
          `[Selection] candidate ${i + 1}/${sample} overall=${overall.toFixed(3)} threshold=${threshold} (discovery=${isDiscoveryBackedCandidate(c.sourceStorylineId)}) passed=${passedQ} title="${(c.title ?? '').slice(0, 50)}..."`
        );
      }
    }

    let zeroSelectedReason: SelectCandidatesInfo['zeroSelectedReason'] | undefined;
    if (passed.length === 0) {
      zeroSelectedReason = 'ALL_FAILED_QUALITY';
    }

    const withRank = passed.map((c) => {
      const overall = c.overall_score ?? c.score / 100;
      const targetCat = getTargetCategory(c.category);
      const bucket = getDurationBucket(c.closesAt, now);
      const diversityBonus = computeDiversityBonus(
        targetCat,
        bucket,
        categoryCounts,
        durationCounts,
        totalActive
      );
      const rankScore = overall + DIVERSITY_WEIGHT * diversityBonus;
      return { candidate: c, rankScore, overall, trendScore: c.qualityScores?.trend_score ?? overall };
    });

    const sorted = [...withRank].sort((a, b) => {
      if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
      const aUniversal = UNIVERSAL_TEMPLATE_IDS.includes(a.candidate.templateId) ? 1 : 0;
      const bUniversal = UNIVERSAL_TEMPLATE_IDS.includes(b.candidate.templateId) ? 1 : 0;
      if (aUniversal !== bUniversal) return aUniversal - bUniversal;
      return (b.trendScore ?? 0) - (a.trendScore ?? 0);
    });

    const selected: ScoredCandidate[] = [];
    const selectedCategoryCounts = new Map<TargetCategory, number>();
    const selectedDurationCounts = new Map<DurationBucket, number>();
    const storylineCounts = new Map<string, number>();

    for (const { candidate } of sorted) {
      if (selected.length >= need) break;

      const targetCat = getTargetCategory(candidate.category);
      const bucket = getDurationBucket(candidate.closesAt, now);

      const catCap = getCategoryCap(targetCat, need);
      const catCount = selectedCategoryCounts.get(targetCat) ?? 0;
      if (catCount >= catCap) continue;

      const maxDurForBucket = Math.ceil(need * DURATION_TARGET_PCT[bucket]);
      const durCount = selectedDurationCounts.get(bucket) ?? 0;
      if (durCount >= maxDurForBucket) continue;

      const storylineCount = storylineCounts.get(candidate.sourceStorylineId) ?? 0;
      if (storylineCount >= MAX_EVENTS_PER_STORYLINE) continue;

      selected.push(candidate);
      selectedCategoryCounts.set(targetCat, catCount + 1);
      selectedDurationCounts.set(bucket, durCount + 1);
      storylineCounts.set(candidate.sourceStorylineId, storylineCount + 1);
    }

    if (selected.length === 0 && passed.length > 0) {
      zeroSelectedReason = 'ALL_FILTERED_BY_CAPS';
    }

    return { selected, zeroSelectedReason };
  })();
}
