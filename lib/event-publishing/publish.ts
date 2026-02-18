/**
 * Publish eventi nel DB con transazione e gestione errori (BLOCCO 5)
 */

import type { PrismaClient } from '@prisma/client';
import type { ScoredCandidate } from './types';
import { generateDedupKey } from './dedup';

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
 * Crea un evento nel DB da un candidato
 */
async function createEventFromCandidate(
  prisma: PrismaClient,
  candidate: ScoredCandidate,
  now: Date,
  systemUserId: string
) {
  const dedupKey = generateDedupKey(
    candidate.title,
    candidate.closesAt,
    candidate.resolutionAuthorityHost
  );

  return prisma.event.create({
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
      dedupKey,
      // Campi obbligatori legacy
      createdById: systemUserId,
      b: 100.0, // Default LMSR parameter
      resolutionBufferHours: 24,
      resolved: false,
      resolutionStatus: 'PENDING',
    },
  });
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

  // Usa transazione per batch insert
  try {
    await prisma.$transaction(async (tx) => {
      for (const candidate of selected) {
        try {
          await createEventFromCandidate(tx, candidate, now, systemUserId);
          createdCount++;
        } catch (error: any) {
          skippedCount++;
          
          // Gestisci errori specifici
          if (error.code === 'P2002') {
            // Unique constraint violation (dedupKey)
            const reason = 'DUPLICATE_DEDUP_KEY';
            reasonsCount[reason] = (reasonsCount[reason] || 0) + 1;
            console.warn(`Skipped duplicate dedupKey for candidate: ${candidate.title}`);
          } else {
            const reason = 'CREATE_ERROR';
            reasonsCount[reason] = (reasonsCount[reason] || 0) + 1;
            console.error(`Error creating event for candidate: ${candidate.title}`, error);
          }
        }
      }
    });
  } catch (error) {
    // Se la transazione fallisce completamente, logga ma non crasha
    console.error('Transaction failed:', error);
    reasonsCount['TRANSACTION_ERROR'] = (reasonsCount['TRANSACTION_ERROR'] || 0) + 1;
  }

  return { createdCount, skippedCount, reasonsCount };
}
