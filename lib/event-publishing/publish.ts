/**
 * Publish eventi nel DB con transazione e gestione errori (BLOCCO 5)
 */

import type { PrismaClient, Prisma } from '@prisma/client';
import type { ScoredCandidate } from './types';
import type { ImageBrief } from '@/lib/event-gen-v2/types';
import { computeDedupKey } from './dedup';
import { ensureAmmStateForEvent } from '@/lib/amm/ensure-amm-state';
import { getBParameterOrDefault } from '@/lib/pricing/initialization';
import { createAuditLog } from '@/lib/audit';

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

/** Optional v2 fields: marketId, sourceType, resolution sources, generation metadata, marketType */
export interface PublishV2Data {
  marketId: string;
  sourceType: string;
  resolutionSourceUrl?: string | null;
  resolutionSourceSecondary?: string | null;
  resolutionSourceTertiary?: string | null;
  resolutionCriteria?: string | null;
  edgeCasePolicyRef?: string | null;
  generatorVersion?: string | null;
  /** BINARY | MULTIPLE_CHOICE | SCALAR | RANGE | THRESHOLD | LADDER | TIME_TO_EVENT | COUNT_VOLUME | RANKING */
  marketType?: string | null;
  /** Per multi-opzione: [{ key, label }]; se assente ma marketType multi-opzione, si può derivare dal titolo in create */
  outcomes?: Array<{ key: string; label: string }> | null;
  generationScores?: {
    trend_score: number;
    psychological_score: number;
    clarity_score: number;
    resolution_score: number;
    novelty_score: number;
    image_score: number;
    overall_score: number;
  } | null;
  creationMetadata?: Record<string, unknown> | null;
  timezone?: string;
  /** Image brief for AI generation (Image Brief Engine) */
  imageBrief?: ImageBrief | null;
  /** football-data.org match ID per risoluzione automatica e matchStatus (live) */
  footballDataMatchId?: number | null;
}

/**
 * Crea un evento nel DB da un candidato.
 * Non crea se dedupKey non calcolabile (MISSING_DEDUPKEY_INPUT).
 * Accetta PrismaClient o client di transazione (tx in $transaction).
 * extraData: optional v2 fields (marketId, sourceType, resolutionSourceUrl)
 */
async function createEventFromCandidate(
  prisma: PrismaClientLike,
  candidate: ScoredCandidate,
  now: Date,
  systemUserId: string,
  extraData?: PublishV2Data
): Promise<{ created: boolean; eventId?: string; reason?: string }> {
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
      b: getBParameterOrDefault(candidate.category),
      resolutionBufferHours: 24,
      resolved: false,
      resolutionStatus: 'PENDING',
      tradingMode: 'AMM',
      ...(extraData && {
        marketId: extraData.marketId,
        sourceType: extraData.sourceType,
        ...(extraData.marketType != null && extraData.marketType !== '' && { marketType: extraData.marketType }),
        ...(extraData.outcomes != null && Array.isArray(extraData.outcomes) && extraData.outcomes.length > 0 && { outcomes: extraData.outcomes as Prisma.InputJsonValue }),
        resolutionSourceUrl: extraData.resolutionSourceUrl ?? undefined,
        resolutionSourceSecondary: extraData.resolutionSourceSecondary ?? undefined,
        resolutionSourceTertiary: extraData.resolutionSourceTertiary ?? undefined,
        resolutionCriteria: extraData.resolutionCriteria ?? undefined,
        edgeCasePolicyRef: extraData.edgeCasePolicyRef ?? undefined,
        generatorVersion: extraData.generatorVersion ?? undefined,
        generationScores: extraData.generationScores ?? undefined,
        creationMetadata:
          extraData.creationMetadata != null
            ? (extraData.creationMetadata as Prisma.InputJsonValue)
            : undefined,
        timezone: extraData.timezone ?? undefined,
        // Immagini eventi: solo categoria standard, nessuna generazione AI
        imageGenerationStatus: 'SUCCESS',
        imageBrief:
          extraData.imageBrief != null
            ? (extraData.imageBrief as unknown as Prisma.InputJsonValue)
            : undefined,
        ...(extraData.footballDataMatchId != null && {
          footballDataMatchId: extraData.footballDataMatchId,
          matchStatus: "SCHEDULED",
        }),
      }),
    },
  });
  await ensureAmmStateForEvent(prisma, event.id);

  // Audit: pipeline-created markets (event-gen-v2)
  const metadata = extraData?.creationMetadata as { created_by_pipeline?: string } | undefined;
  if (metadata?.created_by_pipeline === 'event-gen-v2') {
    await createAuditLog(prisma as PrismaClient, {
      action: 'PIPELINE_MARKET_CREATED',
      entityType: 'event',
      entityId: event.id,
      payload: {
        marketId: extraData?.marketId,
        generationScores: extraData?.generationScores,
      },
    });
  }

  return { created: true, eventId: event.id };
}

export interface PublishOptions {
  /** When provided, called per candidate to get v2 fields (marketId, sourceType, ...). Riceve tx per usare lo stesso client della transazione (es. getNextMarketId deve usare tx per vedere gli eventi appena creati). */
  getV2Data?: (candidate: ScoredCandidate, tx: PrismaClientLike) => Promise<PublishV2Data>;
  /** When provided, used as createdById for created events (e.g. manual submission); otherwise system user */
  createdById?: string;
}

/**
 * Pubblica candidati selezionati nel DB
 */
export async function publishSelected(
  prisma: PrismaClient,
  selected: ScoredCandidate[],
  now: Date,
  options?: PublishOptions
): Promise<{
  createdCount: number;
  skippedCount: number;
  reasonsCount: Record<string, number>;
  eventIds: string[];
}> {
  const reasonsCount: Record<string, number> = {};
  let createdCount = 0;
  let skippedCount = 0;
  const eventIds: string[] = [];

  if (selected.length === 0) {
    return { createdCount: 0, skippedCount: 0, reasonsCount, eventIds };
  }

  const createdById = options?.createdById ?? (await getOrCreateSystemUser(prisma));

  // Timeout 90s: creare N eventi (create + ammState + audit + getNextMarketId) supera i 5s default
  const txTimeoutMs = 90_000;
  try {
    await prisma.$transaction(
      async (tx) => {
        for (const candidate of selected) {
          try {
            const extraData = options?.getV2Data ? await options.getV2Data(candidate, tx) : undefined;
            const { created, eventId, reason } = await createEventFromCandidate(tx, candidate, now, createdById, extraData);
            if (created && eventId) {
              createdCount++;
              eventIds.push(eventId);
            } else {
              skippedCount++;
              if (reason) reasonsCount[reason] = (reasonsCount[reason] || 0) + 1;
            }
          } catch (error: any) {
            skippedCount++;
            if (error.code === 'P2002') {
              reasonsCount['DUPLICATE_DEDUP_KEY'] = (reasonsCount['DUPLICATE_DEDUP_KEY'] || 0) + 1;
              console.warn(`Skipped duplicate dedupKey for candidate: ${candidate.title?.slice(0, 50)}`);
            } else if (error.code === 'IMAGE_VALIDATION_BLOCK') {
              reasonsCount['IMAGE_VALIDATION_BLOCK'] = (reasonsCount['IMAGE_VALIDATION_BLOCK'] || 0) + 1;
              if (process.env.EVENT_GEN_DEBUG === 'true') {
                console.warn(`Skipped image validation for candidate: ${candidate.title?.slice(0, 50)}`, error.message);
              }
            } else {
              reasonsCount['CREATE_ERROR'] = (reasonsCount['CREATE_ERROR'] || 0) + 1;
              console.error(`Error creating event for candidate: ${candidate.title}`, error);
            }
          }
        }
      },
    { timeout: txTimeoutMs }
    );
  } catch (error) {
    console.error('Transaction failed:', error);
    reasonsCount['TRANSACTION_ERROR'] = (reasonsCount['TRANSACTION_ERROR'] || 0) + 1;
  }

  return { createdCount, skippedCount, reasonsCount, eventIds };
}
