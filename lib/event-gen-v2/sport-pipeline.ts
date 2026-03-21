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

/** Chiusura mercato: subito dopo la fine dei 90 minuti (orario inizio + 90 min) */
const MATCH_DURATION_MINUTES = 90;

/** Max fixture da considerare (piano free: 1 chiamata/run; limiti API 10 req/min). */
const SPORT_FIXTURES_LIMIT = 200;
const TEMPLATE_ID_BINARY = 'sport-football-fixture';
const TEMPLATE_ID_TOTAL_GOALS = 'sport-football-total-goals';

const TOTAL_GOALS_OUTCOMES = [
  { key: 'goals_0_1', label: '0-1 gol' },
  { key: 'goals_2', label: '2 gol' },
  { key: 'goals_3', label: '3 gol' },
  { key: 'goals_4_plus', label: '4+ gol' },
] as const;

function fixtureToCandidateBinary(fixture: NewsCandidate): Candidate {
  const matchStart = new Date(fixture.publishedAt);
  const closesAt = new Date(matchStart.getTime() + MATCH_DURATION_MINUTES * 60 * 1000);
  const matchId = fixture.footballDataMatchId;

  return {
    title: fixture.title,
    description: fixture.snippet,
    category: 'Calcio',
    closesAt,
    resolutionAuthorityHost: 'api.football-data.org',
    resolutionAuthorityType: 'REPUTABLE',
    resolutionCriteriaYes:
      'La squadra di casa vince la partita (risultato finale 90\' o supplementari).',
    resolutionCriteriaNo:
      'La squadra di casa non vince (pareggio o vittoria ospiti).',
    sourceStorylineId: matchId != null ? `football-data:${matchId}` : fixture.url,
    templateId: TEMPLATE_ID_BINARY,
    resolutionSourceUrl: fixture.url,
    timezone: 'Europe/Rome',
    sportLeague: fixture.leagueName ?? null,
    footballDataMatchId: matchId ?? null,
    creationMetadata: {
      sport_market_kind: 'MATCH_WINNER_HOME_AWAY',
    },
  };
}

function fixtureToCandidateTotalGoals(fixture: NewsCandidate): Candidate {
  const matchStart = new Date(fixture.publishedAt);
  const closesAt = new Date(matchStart.getTime() + MATCH_DURATION_MINUTES * 60 * 1000);
  const matchId = fixture.footballDataMatchId;

  return {
    title: `Quanti gol totali verranno segnati in ${fixture.title}?`,
    description: `${fixture.snippet}. Mercato multi-outcome con una sola opzione vincente.`,
    category: 'Calcio',
    closesAt,
    resolutionAuthorityHost: 'api.football-data.org',
    resolutionAuthorityType: 'REPUTABLE',
    resolutionCriteriaYes: '',
    resolutionCriteriaNo: '',
    resolutionCriteriaFull:
      'Sommare i gol finali di squadra casa + squadra ospite (fullTime). Risoluzione: 0-1 => goals_0_1; 2 => goals_2; 3 => goals_3; 4 o più => goals_4_plus.',
    marketType: 'MULTIPLE_CHOICE',
    outcomes: [...TOTAL_GOALS_OUTCOMES],
    sourceStorylineId: matchId != null ? `football-data:${matchId}:total-goals` : `${fixture.url}#total-goals`,
    templateId: TEMPLATE_ID_TOTAL_GOALS,
    resolutionSourceUrl: fixture.url,
    timezone: 'Europe/Rome',
    sportLeague: fixture.leagueName ?? null,
    footballDataMatchId: matchId ?? null,
    creationMetadata: {
      sport_market_kind: 'TOTAL_GOALS_BUCKETS',
    },
  };
}

export interface RunSportPipelineParams {
  prisma: PrismaClient;
  now?: Date;
  dryRun?: boolean;
  maxTotal?: number;
}

export interface RunSportPipelineResult {
  fixturesCount: number;
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
  } catch {
    // ignore
  }
  result.fixturesCount = fixtures.length;
  if (fixtures.length === 0) {
    return result;
  }

  const candidates: Candidate[] = fixtures.flatMap((fixture) => [
    fixtureToCandidateBinary(fixture),
    fixtureToCandidateTotalGoals(fixture),
  ]);
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
    storylineStatsMap.set(c.sourceStorylineId, { momentum: 70, novelty: 60 });
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
