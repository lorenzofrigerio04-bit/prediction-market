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

/** Soglia sotto cui un bot viene ricaricato (ensureBotsHaveCredits) */
const BOT_CREDITS_THRESHOLD = 1000;

/** Nomi italiani plausibili per nome/username bot (pool ciclica) */
const ITALIAN_NAMES = [
  "Marco",
  "Luca",
  "Alessandro",
  "Matteo",
  "Lorenzo",
  "Francesco",
  "Andrea",
  "Giuseppe",
  "Giovanni",
  "Antonio",
  "Paolo",
  "Simone",
  "Davide",
  "Federico",
  "Stefano",
  "Riccardo",
  "Filippo",
  "Nicola",
  "Elena",
  "Chiara",
  "Sara",
  "Martina",
  "Laura",
  "Francesca",
  "Valentina",
  "Giulia",
  "Anna",
  "Alessandra",
  "Federica",
  "Silvia",
];

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
 * Nome dalla pool (indice 0-based).
 */
function nameFromPool(index: number): string {
  return ITALIAN_NAMES[index % ITALIAN_NAMES.length];
}

/**
 * Username univoco: nome in minuscolo + suffisso numerico (es. marco_1).
 */
function usernameForBot(name: string, index: number): string {
  const base = name.toLowerCase().replace(/\s+/g, "_");
  return `${base}_${index}`;
}

/**
 * Recupera o crea N utenti bot con email bot-1@simulation.internal, bot-2@..., ecc.
 * Crea utenti mancanti con nome dalla pool italiana, username univoco, password null,
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
      select: { id: true, email: true, name: true, username: true },
    });

    if (!user) {
      const name = nameFromPool(i - 1);
      const username = usernameForBot(name, i);
      user = await prisma.user.create({
        data: {
          email,
          name,
          username,
          password: null,
          credits: BOT_INITIAL_CREDITS,
          role: "BOT",
        },
        select: { id: true, email: true, name: true, username: true },
      });
    }

    result.push({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
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
