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
 * Normalizza testo per dedupKey (single source of truth)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .replace(/[.,!:"']/g, ''); // rimuovi punctuation semplice
}

/** Alias per uso condiviso con publish/backfill */
export const normalizeTitle = normalizeText;

export interface ComputeDedupKeyInput {
  title: string;
  closesAt: Date;
  resolutionAuthorityHost: string;
}

/**
 * Calcola dedupKey deterministico (single source of truth).
 * - Usa sha256(normalize(title) + "|" + yyyy-mm-dd(closesAt UTC) + "|" + resolutionAuthorityHost).
 * - Lancia se resolutionAuthorityHost è null/undefined/vuoto.
 */
export function computeDedupKey(input: ComputeDedupKeyInput): string {
  const { title, closesAt, resolutionAuthorityHost } = input;
  const host = resolutionAuthorityHost?.trim() ?? '';
  if (host === '') {
    throw new Error('resolutionAuthorityHost must be non-empty for dedupKey');
  }
  const normalizedTitle = normalizeTitle(title);
  const dateStr = closesAt.toISOString().split('T')[0]; // yyyy-mm-dd UTC
  const combined = `${normalizedTitle}|${dateStr}|${host}`;
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Genera dedupKey deterministico (delega a computeDedupKey).
 * @deprecated Prefer computeDedupKey per nuovo codice.
 */
export function generateDedupKey(
  title: string,
  closesAt: Date,
  resolutionAuthorityHost: string
): string {
  return computeDedupKey({ title, closesAt, resolutionAuthorityHost });
}

/**
 * Dedup intra-run: mantiene solo il candidato con score maggiore per ogni dedupKey.
 * Candidati senza resolutionAuthorityHost valido vengono esclusi.
 */
export function dedupIntraRun(candidates: ScoredCandidate[]): ScoredCandidate[] {
  const map = new Map<string, ScoredCandidate>();

  for (const candidate of candidates) {
    let dedupKey: string;
    try {
      dedupKey = computeDedupKey({
        title: candidate.title,
        closesAt: candidate.closesAt,
        resolutionAuthorityHost: candidate.resolutionAuthorityHost,
      });
    } catch {
      continue; // skip candidati senza host valido
    }

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

  // Genera dedupKeys per tutti i candidati (escludi chi non ha host valido)
  const candidatesWithKeys: { candidate: ScoredCandidate; dedupKey: string }[] = [];
  for (const candidate of candidates) {
    try {
      const dedupKey = computeDedupKey({
        title: candidate.title,
        closesAt: candidate.closesAt,
        resolutionAuthorityHost: candidate.resolutionAuthorityHost,
      });
      candidatesWithKeys.push({ candidate, dedupKey });
    } catch {
      // skip: nessun dedupKey, non considerare come duplicato in DB
    }
  }

  if (candidatesWithKeys.length === 0) {
    return { deduped: [], reasonsCount };
  }

  const dedupKeys = candidatesWithKeys.map(c => c.dedupKey);
  const now = new Date();
  // Duplicato solo se: status OPEN e closesAt > now (eventi attivi)
  const existingEvents = await prisma.event.findMany({
    where: {
      dedupKey: { in: dedupKeys },
      status: 'OPEN',
      closesAt: { gt: now },
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
