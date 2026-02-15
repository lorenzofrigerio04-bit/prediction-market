/**
 * Runner: esegue una run completa di attività simulata (previsioni, commenti, reazioni, follow).
 * Usato dal cron Vercel e dallo script locale scripts/simulate-activity.ts.
 */

import type { PrismaClient } from "@prisma/client";
import { getOrCreateBotUsers, ensureBotsHaveCredits } from "./bot-users";
import { runSimulatedPredictions } from "./predictions";
import { runSimulatedComments } from "./comments";
import { runSimulatedReactions } from "./reactions";
import { runSimulatedFollows } from "./followers";

const BOT_COUNT = 20;

export interface RunSimulatedActivityResult {
  ok: boolean;
  predictions: { created: number; errors: number };
  comments: { created: number; errors: number };
  reactions: { created: number; errors: number };
  follows: { created: number; errors: number };
  botsToppedUp: number;
  timestamp: string;
}

/**
 * Esegue una run completa di attività simulata: crea/recupera bot, assicura crediti,
 * poi esegue in sequenza previsioni, commenti, reazioni e follow simulate.
 */
export async function runSimulatedActivity(
  prisma: PrismaClient
): Promise<RunSimulatedActivityResult> {
  const bots = await getOrCreateBotUsers(prisma, BOT_COUNT);
  const botUserIds = bots.map((b) => b.id);

  const topped = await ensureBotsHaveCredits(prisma);

  const [predictions, comments, reactions, follows] = await Promise.all([
    runSimulatedPredictions(prisma, botUserIds),
    runSimulatedComments(prisma, botUserIds),
    runSimulatedReactions(prisma, botUserIds),
    runSimulatedFollows(prisma, botUserIds),
  ]);

  return {
    ok: true,
    predictions: { created: predictions.created, errors: predictions.errors.length },
    comments: { created: comments.created, errors: comments.errors.length },
    reactions: { created: reactions.created, errors: reactions.errors.length },
    follows: { created: follows.created, errors: follows.errors.length },
    botsToppedUp: topped.length,
    timestamp: new Date().toISOString(),
  };
}
