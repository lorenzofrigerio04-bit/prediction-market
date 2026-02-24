/**
 * Publish eventi nel DB con transazione e gestione errori (BLOCCO 5)
 */

import type { PrismaClient } from '@prisma/client';
import type { ScoredCandidate } from './types';
import { computeDedupKey } from './dedup';
import { ensureAmmStateForEvent } from '@/lib/amm/ensure-amm-state';

/** Client Prisma completo o client di transazione (usato in $transaction) */
type PrismaClientLike = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Ottiene o crea utente sistema per creazione eventi automatici
 */
async function getOrCreateSystemUser(prisma: PrismaClient): Promise<string> {
  // Cerca utente con role BOT o SYSTEM
  const systemUser = await prisma.user.findFirst({
    where: {
      role: {
        in: ['BOT', 'SYSTEM'],
      },
    },
    select: { id: true },
  });

  if (systemUser) {
    return systemUser.id;
  }

  // Se non esiste, prova con SYSTEM_USER_ID da env
  const envUserId = process.env.SYSTEM_USER_ID;
  if (envUserId) {
    const user = await prisma.user.findUnique({
      where: { id: envUserId },
      select: { id: true },
    });
    if (user) {
      return user.id;
    }
  }

  // Se non esiste, crea utente sistema
  const newSystemUser = await prisma.user.create({
    data: {
      email: 'system@prediction-market.local',
      name: 'System',
      role: 'BOT',
      credits: 0,
      streakCount: 0,
      totalEarned: 0,
    },
    select: { id: true },
  });

  return newSystemUser.id;
}

/**
 * Crea un evento nel DB da un candidato.
 * Non crea se dedupKey non calcolabile (MISSING_DEDUPKEY_INPUT).
 * Accetta PrismaClient o client di transazione (tx in $transaction).
 */
async function createEventFromCandidate(
  prisma: PrismaClientLike,
  candidate: ScoredCandidate,
  now: Date,
  systemUserId: string
): Promise<{ created: boolean; reason?: string }> {
  let dedupKey: string;
  try {
    dedupKey = computeDedupKey({
      title: candidate.title,
      closesAt: candidate.closesAt,
      resolutionAuthorityHost: candidate.resolutionAuthorityHost,
    });
  } catch {
    if (process.env.EVENT_GEN_DEBUG === 'true') {
      console.warn('[Event Publish] Skip candidate (MISSING_DEDUPKEY_INPUT):', candidate.title?.slice(0, 50));
    }
    return { created: false, reason: 'MISSING_DEDUPKEY_INPUT' };
  }

  if (process.env.EVENT_GEN_DEBUG === 'true') {
    console.log('[Event Publish] Creating event dedupKey=', dedupKey.slice(0, 16) + '...', 'title=', candidate.title?.slice(0, 40));
  }

  const event = await prisma.event.create({
    data: {
      title: candidate.title,
      description: candidate.description,
      category: candidate.category,
      status: 'OPEN',
      closesAt: candidate.closesAt,
      resolutionAuthorityHost: candidate.resolutionAuthorityHost,
      resolutionAuthorityType: candidate.resolutionAuthorityType,
      resolutionCriteriaYes: candidate.resolutionCriteriaYes,
      resolutionCriteriaNo: candidate.resolutionCriteriaNo,
      sourceStorylineId: candidate.sourceStorylineId,
      templateId: candidate.templateId,
      dedupKey, // sempre valorizzato
      createdById: systemUserId,
      b: 100.0,
      resolutionBufferHours: 24,
      resolved: false,
      resolutionStatus: 'PENDING',
      tradingMode: 'AMM',
    },
  });
  await ensureAmmStateForEvent(prisma, event.id);
  return { created: true };
}

/**
 * Pubblica candidati selezionati nel DB
 */
export async function publishSelected(
  prisma: PrismaClient,
  selected: ScoredCandidate[],
  now: Date
): Promise<{
  createdCount: number;
  skippedCount: number;
  reasonsCount: Record<string, number>;
}> {
  const reasonsCount: Record<string, number> = {};
  let createdCount = 0;
  let skippedCount = 0;

  if (selected.length === 0) {
    return { createdCount: 0, skippedCount: 0, reasonsCount };
  }

  // Ottieni o crea utente sistema (una volta, fuori dalla transazione)
  const systemUserId = await getOrCreateSystemUser(prisma);

  try {
    await prisma.$transaction(async (tx) => {
      for (const candidate of selected) {
        try {
          const { created, reason } = await createEventFromCandidate(tx, candidate, now, systemUserId);
          if (created) {
            createdCount++;
          } else {
            skippedCount++;
            if (reason) reasonsCount[reason] = (reasonsCount[reason] || 0) + 1;
          }
        } catch (error: any) {
          skippedCount++;
          if (error.code === 'P2002') {
            reasonsCount['DUPLICATE_DEDUP_KEY'] = (reasonsCount['DUPLICATE_DEDUP_KEY'] || 0) + 1;
            console.warn(`Skipped duplicate dedupKey for candidate: ${candidate.title?.slice(0, 50)}`);
          } else {
            reasonsCount['CREATE_ERROR'] = (reasonsCount['CREATE_ERROR'] || 0) + 1;
            console.error(`Error creating event for candidate: ${candidate.title}`, error);
          }
        }
      }
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    reasonsCount['TRANSACTION_ERROR'] = (reasonsCount['TRANSACTION_ERROR'] || 0) + 1;
  }

  return { createdCount, skippedCount, reasonsCount };
}
