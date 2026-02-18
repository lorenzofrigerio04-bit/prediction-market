/**
 * Selezione candidati con caps e target (BLOCCO 5)
 * 
 * Seleziona candidati rispettando:
 * - TARGET_OPEN_EVENTS: numero target di eventi OPEN
 * - CATEGORY_CAP_DEFAULT: max eventi per categoria
 * - MAX_EVENTS_PER_STORYLINE: max eventi per storyline
 */

import type { PrismaClient } from '@prisma/client';
import type { ScoredCandidate } from './types';

const TARGET_OPEN_EVENTS_DEFAULT = 40;
const TARGET_OPEN_EVENTS = parseInt(process.env.TARGET_OPEN_EVENTS || String(TARGET_OPEN_EVENTS_DEFAULT), 10) || TARGET_OPEN_EVENTS_DEFAULT;
const CATEGORY_CAP_DEFAULT = parseInt(process.env.CATEGORY_CAP_DEFAULT || '10', 10);
/** Max 1 evento per storyline per run (diversità) */
const MAX_EVENTS_PER_STORYLINE = 1;
const UNIVERSAL_TEMPLATE_IDS = ['universal-v1', 'universal-v2', 'universal-v3', 'universal-fallback'];

const SELECT_DEBUG = process.env.PIPELINE_DEBUG === 'true';

/**
 * Conta eventi OPEN attuali (status OPEN e closesAt > now)
 */
async function countOpenEvents(prisma: PrismaClient, now: Date): Promise<number> {
  return prisma.event.count({
    where: {
      status: 'OPEN',
      closesAt: { gt: now },
    },
  });
}

export interface SelectCandidatesInfo {
  selected: ScoredCandidate[];
  openEventsCount: number;
  targetOpenEvents: number;
  need: number;
}

/**
 * Seleziona candidati e restituisce info per audit (open, target, need)
 */
export async function selectCandidatesWithInfo(
  prisma: PrismaClient,
  candidates: ScoredCandidate[],
  now: Date
): Promise<SelectCandidatesInfo> {
  const openEventsCount = await countOpenEvents(prisma, now);
  const targetOpenEvents = TARGET_OPEN_EVENTS;
  const need = Math.max(0, targetOpenEvents - openEventsCount);

  if (SELECT_DEBUG) {
    console.log(`[Selection] openEventsCount=${openEventsCount} target=${targetOpenEvents} need=${need}`);
  }

  const selected = await selectCandidatesInternal(prisma, candidates, now, need);
  return { selected, openEventsCount, targetOpenEvents, need };
}

/**
 * Seleziona candidati rispettando caps e target
 */
export async function selectCandidates(
  prisma: PrismaClient,
  candidates: ScoredCandidate[],
  now: Date
): Promise<ScoredCandidate[]> {
  const openEventsCount = await countOpenEvents(prisma, now);
  const need = Math.max(0, TARGET_OPEN_EVENTS - openEventsCount);
  return selectCandidatesInternal(prisma, candidates, now, need);
}

function selectCandidatesInternal(
  _prisma: PrismaClient,
  candidates: ScoredCandidate[],
  _now: Date,
  need: number
): Promise<ScoredCandidate[]> {
  if (need === 0) {
    return Promise.resolve([]);
  }

  // Ordina per score desc; a parità di score preferisci template non-universal (tie-breaker)
  const sorted = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aUniversal = UNIVERSAL_TEMPLATE_IDS.includes(a.templateId) ? 1 : 0;
    const bUniversal = UNIVERSAL_TEMPLATE_IDS.includes(b.templateId) ? 1 : 0;
    return aUniversal - bUniversal; // non-universal first
  });

  const selected: ScoredCandidate[] = [];
  const categoryCounts = new Map<string, number>();
  const storylineCounts = new Map<string, number>();

  for (const candidate of sorted) {
    if (selected.length >= need) break;
    const categoryCount = categoryCounts.get(candidate.category) || 0;
    const categoryCap = parseInt(
      process.env[`CATEGORY_CAP_${candidate.category.toUpperCase()}`] || CATEGORY_CAP_DEFAULT.toString(),
      10
    );
    if (categoryCount >= categoryCap) continue;
    const storylineCount = storylineCounts.get(candidate.sourceStorylineId) || 0;
    if (storylineCount >= MAX_EVENTS_PER_STORYLINE) continue;
    selected.push(candidate);
    categoryCounts.set(candidate.category, categoryCount + 1);
    storylineCounts.set(candidate.sourceStorylineId, storylineCount + 1);
  }

  return Promise.resolve(selected);
}
