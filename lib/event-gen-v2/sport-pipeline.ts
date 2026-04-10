/**
 * Pipeline dedicata eventi sport (pagina /sport).
 * Fetch fixture da football-data.org (calcio) → Candidate → validate → score → dedup → select → publish (sourceType=SPORT).
 * Risoluzione automatica tramite footballDataMatchId; stato live aggiornato da cron.
 */

import type { PrismaClient } from '@prisma/client';
import type { NewsCandidate } from '@/lib/event-sources/types';
import { fetchFootballFixturesFootballDataOrg } from '@/lib/event-sources';
import type { Candidate } from './types';
import { validateCandidates } from './rulebook-validator';
import { scoreCandidates } from '@/lib/event-publishing/scoring';
import { dedupCandidates, publishSelectedV2 } from './publisher';
import { buildSportMediaAwareCandidates } from './sport-media-agent';

/** Max fixture da considerare (piano free: 1 chiamata/run; limiti API 10 req/min). */
const SPORT_FIXTURES_LIMIT = 200;

export interface RunSportPipelineParams {
  prisma: PrismaClient;
  now?: Date;
  dryRun?: boolean;
  maxTotal?: number;
}

export interface RunSportPipelineResult {
  fixturesCount: number;
  fixturesFetchError?: string;
  candidatesCount: number;
  rulebookValidCount: number;
  rulebookRejectedCount: number;
  dedupedCandidatesCount: number;
  selectedCount: number;
  createdCount: number;
  skippedCount: number;
  reasonsCount: Record<string, number>;
  eventIds?: string[];
}

/**
 * Esegue la pipeline sport: solo fixture calcio → eventi categoria Calcio, sourceType SPORT (visibili solo in /sport).
 */
export async function runSportPipeline(
  params: RunSportPipelineParams
): Promise<RunSportPipelineResult> {
  const { prisma, now = new Date(), dryRun = false, maxTotal = 100 } = params;

  const result: RunSportPipelineResult = {
    fixturesCount: 0,
    candidatesCount: 0,
    rulebookValidCount: 0,
    rulebookRejectedCount: 0,
    dedupedCandidatesCount: 0,
    selectedCount: 0,
    createdCount: 0,
    skippedCount: 0,
    reasonsCount: {},
  };

  let fixtures: NewsCandidate[] = [];
  try {
    fixtures = await fetchFootballFixturesFootballDataOrg(SPORT_FIXTURES_LIMIT);
  } catch (error) {
    result.fixturesFetchError = error instanceof Error ? error.message : String(error);
  }
  result.fixturesCount = fixtures.length;
  if (fixtures.length === 0) {
    return result;
  }

  let candidates: Candidate[] = [];
  try {
    candidates = await buildSportMediaAwareCandidates(fixtures);
  } catch {
    // ignore and fallback
  }
  if (candidates.length === 0) {
    // Fallback ultra-safe: garantisce continuità operativa anche se media-agent è indisponibile.
    candidates = fixtures.map((fixture) => {
      const matchStart = new Date(fixture.publishedAt);
      const closesAt = new Date(matchStart.getTime() + 90 * 60 * 1000);
      const matchId = fixture.footballDataMatchId;
      return {
        title: `Vincerà la squadra di casa in ${fixture.title}?`,
        description: fixture.snippet,
        category: 'Calcio',
        closesAt,
        resolutionAuthorityHost: 'api.football-data.org',
        resolutionAuthorityType: 'REPUTABLE',
        resolutionCriteriaYes:
          'La squadra di casa vince la partita (risultato finale 90\' o supplementari).',
        resolutionCriteriaNo:
          'La squadra di casa non vince (pareggio o vittoria ospiti).',
        sourceStorylineId: matchId != null ? `football-data:${matchId}:home-win` : fixture.url,
        templateId: 'sport-football-fixture',
        resolutionSourceUrl: fixture.url,
        timezone: 'Europe/Rome',
        sportLeague: fixture.leagueName ?? null,
        footballDataMatchId: matchId ?? null,
        creationMetadata: {
          sport_market_kind: 'MATCH_WINNER_HOME_AWAY',
        },
      };
    });
  }
  result.candidatesCount = candidates.length;

  const validationResult = validateCandidates(candidates);
  const validCandidates = validationResult.valid;
  result.rulebookValidCount = validCandidates.length;
  result.rulebookRejectedCount = validationResult.rejected.length;
  for (const [k, v] of Object.entries(validationResult.rejectionReasons)) {
    result.reasonsCount[k] = (result.reasonsCount[k] ?? 0) + v;
  }

  if (validCandidates.length === 0) {
    return result;
  }

  const storylineStatsMap = new Map<string, { momentum: number; novelty: number }>();
  for (const c of validCandidates) {
    const momentum = typeof c.momentum === 'number' ? c.momentum : 70;
    const novelty = typeof c.novelty === 'number' ? c.novelty : 60;
    storylineStatsMap.set(c.sourceStorylineId, { momentum, novelty });
  }
  const scored = scoreCandidates(validCandidates, storylineStatsMap);

  const { deduped, reasonsCount: dedupReasons } = await dedupCandidates(prisma, scored);
  result.dedupedCandidatesCount = deduped.length;
  Object.assign(result.reasonsCount, dedupReasons);

  if (deduped.length === 0) {
    return result;
  }

  // Sport: seleziona fino a maxTotal (non dipende dal target eventi HOME/NEWS)
  const selected = deduped.slice(0, maxTotal);
  result.selectedCount = selected.length;

  if (selected.length === 0) {
    return result;
  }

  if (!dryRun) {
    const publishResult = await publishSelectedV2(prisma, selected, now, {
      sourceType: 'SPORT',
    });
    result.createdCount = publishResult.createdCount;
    result.skippedCount = publishResult.skippedCount;
    Object.assign(result.reasonsCount, publishResult.reasonsCount);
    result.eventIds = publishResult.eventIds ?? [];
  }

  return result;
}
