/**
 * Deduplicazione robusta per candidati eventi (BLOCCO 5)
 * 
 * - Intra-run: rimuove duplicati nello stesso batch
 * - DB dedup: rimuove candidati con dedupKey già presente nel DB
 */

import { createHash } from 'crypto';
import type { PrismaClient } from '@prisma/client';
import type { ScoredCandidate } from './types';

/**
 * Normalizza testo per dedupKey
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .replace(/[.,!:"']/g, ''); // rimuovi punctuation semplice
}

/**
 * Genera dedupKey deterministico
 */
export function generateDedupKey(
  title: string,
  closesAt: Date,
  resolutionAuthorityHost: string
): string {
  const normalizedTitle = normalizeText(title);
  const dateStr = closesAt.toISOString().split('T')[0]; // yyyy-mm-dd
  const host = resolutionAuthorityHost || '';
  
  const combined = `${normalizedTitle}|${dateStr}|${host}`;
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Dedup intra-run: mantiene solo il candidato con score maggiore per ogni dedupKey
 */
export function dedupIntraRun(candidates: ScoredCandidate[]): ScoredCandidate[] {
  const map = new Map<string, ScoredCandidate>();

  for (const candidate of candidates) {
    const dedupKey = generateDedupKey(
      candidate.title,
      candidate.closesAt,
      candidate.resolutionAuthorityHost
    );

    const existing = map.get(dedupKey);
    if (!existing || candidate.score > existing.score) {
      map.set(dedupKey, candidate);
    }
  }

  return Array.from(map.values());
}

/**
 * Dedup DB: rimuove candidati con dedupKey già presente nel DB
 */
export async function dedupFromDB(
  prisma: PrismaClient,
  candidates: ScoredCandidate[]
): Promise<{
  deduped: ScoredCandidate[];
  reasonsCount: Record<string, number>;
}> {
  const reasonsCount: Record<string, number> = {
    DUPLICATE_IN_RUN: 0,
    DUPLICATE_IN_DB: 0,
  };

  // Genera dedupKeys per tutti i candidati
  const candidatesWithKeys = candidates.map(candidate => ({
    candidate,
    dedupKey: generateDedupKey(
      candidate.title,
      candidate.closesAt,
      candidate.resolutionAuthorityHost
    ),
  }));

  // Query DB per dedupKeys esistenti (eventi OPEN o tutti se unique globale)
  const dedupKeys = candidatesWithKeys.map(c => c.dedupKey);
  const existingEvents = await prisma.event.findMany({
    where: {
      dedupKey: {
        in: dedupKeys,
      },
      // Se dedupKey è unique globale, non serve filtro status
      // Altrimenti filtra per OPEN
      status: 'OPEN',
    },
    select: {
      dedupKey: true,
    },
  });

  const existingKeysSet = new Set(existingEvents.map(e => e.dedupKey));

  // Filtra candidati con dedupKey già presente
  const deduped = candidatesWithKeys
    .filter(({ dedupKey }) => {
      if (existingKeysSet.has(dedupKey)) {
        reasonsCount.DUPLICATE_IN_DB++;
        return false;
      }
      return true;
    })
    .map(({ candidate }) => candidate);

  return { deduped, reasonsCount };
}

/**
 * Dedup completo: intra-run + DB
 */
export async function dedupCandidates(
  prisma: PrismaClient,
  candidates: ScoredCandidate[]
): Promise<{
  deduped: ScoredCandidate[];
  reasonsCount: Record<string, number>;
}> {
  // Prima dedup intra-run
  const intraRunDeduped = dedupIntraRun(candidates);
  const intraRunSkipped = candidates.length - intraRunDeduped.length;

  // Poi dedup DB
  const { deduped, reasonsCount } = await dedupFromDB(prisma, intraRunDeduped);
  reasonsCount.DUPLICATE_IN_RUN = intraRunSkipped;

  return { deduped, reasonsCount };
}
