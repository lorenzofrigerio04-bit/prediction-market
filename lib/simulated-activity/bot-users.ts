/**
 * Creazione e recupero utenti bot per attività simulata.
 * Bot identificabili da role "BOT" e/o email *@simulation.internal.
 */

import type { PrismaClient } from "@prisma/client";
import {
  BOT_EMAIL_PREFIX,
  BOT_EMAIL_DOMAIN,
  BOT_INITIAL_CREDITS,
} from "./config";
import { applyCreditTransaction } from "../apply-credit-transaction";
import { CREDIT_TRANSACTION_TYPES } from "../credits-config";
import { socialIdentityForIndex } from "./social-identities";

/** Soglia sotto cui un bot viene ricaricato (ensureBotsHaveCredits) */
const BOT_CREDITS_THRESHOLD = 1000;

export interface BotUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
}

/**
 * Restituisce l'email prevista per il bot con indice i (1-based).
 */
function botEmail(i: number): string {
  return `${BOT_EMAIL_PREFIX}${i}@${BOT_EMAIL_DOMAIN}`;
}

/**
 * Recupera o crea N utenti bot con email bot-1@simulation.internal, bot-2@..., ecc.
 * Crea utenti mancanti con identità social inglese (handle + avatar), password null,
 * credits = BOT_INITIAL_CREDITS, role = "BOT".
 * Restituisce la lista di bot (id, email, name, username).
 */
export async function getOrCreateBotUsers(
  prisma: PrismaClient,
  count: number
): Promise<BotUser[]> {
  const result: BotUser[] = [];

  for (let i = 1; i <= count; i++) {
    const email = botEmail(i);
    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      const identity = socialIdentityForIndex(i - 1);
      user = await prisma.user.create({
        data: {
          email,
          name: identity.name,
          image: identity.image,
          credits: BOT_INITIAL_CREDITS,
          role: "BOT",
        },
        select: { id: true, email: true, name: true },
      });
    }

    result.push({
      id: user.id,
      email: user.email ?? "",
      name: user.name,
      username: user.name,
    });
  }

  return result;
}

/**
 * Se un bot ha crediti sotto BOT_CREDITS_THRESHOLD (es. 1000), effettua una
 * transazione di tipo SIMULATED_TOPUP per portarlo a BOT_INITIAL_CREDITS.
 * I bot sono identificati da role "BOT" (o email *@simulation.internal se non usi role).
 */
export async function ensureBotsHaveCredits(
  prisma: PrismaClient
): Promise<{ userId: string; toppedUp: number }[]> {
  const bots = await prisma.user.findMany({
    where: { role: "BOT" },
    select: { id: true, credits: true },
  });

  const topped: { userId: string; toppedUp: number }[] = [];

  for (const bot of bots) {
    if (bot.credits >= BOT_CREDITS_THRESHOLD) continue;

    const needed = BOT_INITIAL_CREDITS - bot.credits;
    await applyCreditTransaction(
      prisma,
      bot.id,
      CREDIT_TRANSACTION_TYPES.SIMULATED_TOPUP,
      needed,
      {
        description: "Ricarica crediti simulazione bot",
        referenceType: "simulated_topup",
      }
    );
    topped.push({ userId: bot.id, toppedUp: needed });
  }

  return topped;
}
