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

const TARGET_OPEN_EVENTS = parseInt(process.env.TARGET_OPEN_EVENTS || '40', 10);
const CATEGORY_CAP_DEFAULT = parseInt(process.env.CATEGORY_CAP_DEFAULT || '10', 10);
const MAX_EVENTS_PER_STORYLINE = parseInt(process.env.MAX_EVENTS_PER_STORYLINE || '3', 10);

/**
 * Conta eventi OPEN attuali
 */
async function countOpenEvents(prisma: PrismaClient, now: Date): Promise<number> {
  return prisma.event.count({
    where: {
      status: 'OPEN',
      closesAt: {
        gt: now,
      },
    },
  });
}

/**
 * Seleziona candidati rispettando caps e target
 */
export async function selectCandidates(
  prisma: PrismaClient,
  candidates: ScoredCandidate[],
  now: Date
): Promise<ScoredCandidate[]> {
  // Calcola need
  const openEventsCount = await countOpenEvents(prisma, now);
  const need = Math.max(0, TARGET_OPEN_EVENTS - openEventsCount);

  if (need === 0) {
    return [];
  }

  // Ordina per score desc
  const sorted = [...candidates].sort((a, b) => b.score - a.score);

  // Applica caps
  const selected: ScoredCandidate[] = [];
  const categoryCounts = new Map<string, number>();
  const storylineCounts = new Map<string, number>();

  for (const candidate of sorted) {
    if (selected.length >= need) {
      break;
    }

    // Controlla category cap
    const categoryCount = categoryCounts.get(candidate.category) || 0;
    const categoryCap = parseInt(
      process.env[`CATEGORY_CAP_${candidate.category.toUpperCase()}`] || 
      CATEGORY_CAP_DEFAULT.toString(),
      10
    );
    if (categoryCount >= categoryCap) {
      continue;
    }

    // Controlla storyline cap
    const storylineCount = storylineCounts.get(candidate.sourceStorylineId) || 0;
    if (storylineCount >= MAX_EVENTS_PER_STORYLINE) {
      continue;
    }

    // Aggiungi candidato
    selected.push(candidate);
    categoryCounts.set(candidate.category, categoryCount + 1);
    storylineCounts.set(candidate.sourceStorylineId, storylineCount + 1);
  }

  return selected;
}
