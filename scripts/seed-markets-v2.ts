#!/usr/bin/env tsx
/**
 * Seed 12 initial markets in Event Gen v2 format.
 *
 * Creates events with:
 * - marketId (PM-YYYY-NNNNN)
 * - sourceType: NEWS
 * - generatorVersion: 2.0
 * - dedupKey (deterministic)
 *
 * Run after markets:purge and with EVENT_GEN_V2=true.
 *
 * Usage:
 *   pnpm markets:seed-v2
 */

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });
import { PrismaClient } from "@prisma/client";
import { getBParameterOrDefault } from "../lib/pricing/initialization";
import { getBufferHoursForCategory } from "../lib/markets";
import { ensureAmmStateForEvent } from "../lib/amm/ensure-amm-state";
import { computeDedupKey } from "../lib/event-publishing/dedup";
import { getNextMarketId } from "../lib/event-gen-v2/market-id";

const prisma = new PrismaClient();

const SEED_COUNT = 12;

const CATEGORIES = [
  "Sport",
  "Tecnologia",
  "Economia",
  "Scienza",
  "Intrattenimento",
] as const;

const TITLES: Record<string, string[]> = {
  Sport: [
    "La squadra di casa vince la prossima partita di campionato?",
    "Il favorito vince il prossimo Grand Slam?",
    "Oltre 2.5 gol nella finale di coppa?",
  ],
  Tecnologia: [
    "Apple lancia un nuovo iPhone entro il prossimo trimestre?",
    "Il prezzo di Nvidia supera 150$ entro fine mese?",
    "Un grande modello open-source supera GPT-4 su MMLU?",
  ],
  Economia: [
    "Bitcoin supera 100.000$ entro fine anno?",
    "La Fed taglia i tassi nel prossimo meeting?",
    "L'indice S&P 500 chiude in rialzo questa settimana?",
  ],
  Scienza: [
    "Temperatura massima domani sopra i 30°C in centro?",
    "Piove durante il weekend nella tua città?",
    "Viene annunciata una missione con equipaggio su Marte entro il 2030?",
  ],
  Intrattenimento: [
    "Il film favorito vince l'Oscar al miglior film?",
    "La serie più attesa esce nella prossima stagione?",
    "Un artista italiano vince Sanremo?",
  ],
};

function randomHours(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomPInit(): number {
  return Math.round((0.35 + Math.random() * 0.3) * 100) / 100;
}

function quantitiesForPInit(
  pInit: number,
  b: number
): { q_yes: number; q_no: number } {
  if (pInit <= 0 || pInit >= 1) return { q_yes: 0, q_no: 0 };
  if (Math.abs(pInit - 0.5) < 0.001) return { q_yes: 0, q_no: 0 };
  if (pInit > 0.5) {
    const q_yes = b * Math.log(pInit / (1 - pInit));
    return { q_yes, q_no: 0 };
  }
  const q_no = b * Math.log((1 - pInit) / pInit);
  return { q_yes: 0, q_no };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not configured.");
    process.exit(1);
  }

  console.log("=== Seed 12 Markets (Event Gen v2) ===\n");

  let systemUser = await prisma.user.findUnique({
    where: { email: "event-generator@system" },
  });
  if (!systemUser) {
    systemUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });
  }
  if (!systemUser) {
    throw new Error("No system or admin user found. Run db:seed first.");
  }

  const now = new Date();
  const year = now.getFullYear();
  const createdIds: string[] = [];

  for (let i = 0; i < SEED_COUNT; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const pool = TITLES[category] ?? [];
    const title =
      pool.length > 0 ? pool[i % pool.length]! : `Mercato ${category} #${i + 1}`;

    const closeInHours = randomHours(2, 72);
    const bufferHours = getBufferHoursForCategory(category);
    const marketCloseTime = new Date(
      now.getTime() + closeInHours * 60 * 60 * 1000
    );
    const realWorldEventTime = new Date(
      marketCloseTime.getTime() + (bufferHours + 1) * 60 * 60 * 1000
    );

    const b = getBParameterOrDefault(category);
    const p_init = randomPInit();
    const { q_yes, q_no } = quantitiesForPInit(p_init, b);

    const marketId = await getNextMarketId(prisma, year);
    const dedupKey = computeDedupKey({
      title,
      closesAt: marketCloseTime,
      resolutionAuthorityHost: `seed.event-gen-v2.${marketId}`,
    });

    const event = await prisma.event.create({
      data: {
        title,
        description: `Mercato Event Gen v2 (${category}). Chiusura tra ${Math.round(closeInHours)}h.`,
        category,
        closesAt: marketCloseTime,
        realWorldEventTime,
        resolutionTimeExpected: realWorldEventTime,
        resolutionBufferHours: bufferHours,
        resolutionStatus: "PENDING",
        resolutionSourceUrl: "https://example.com/resolution",
        resolutionNotes: "Risoluzione da fonte ufficiale.",
        createdById: systemUser.id,
        p_init,
        b,
        q_yes,
        q_no,
        tradingMode: "AMM",
        status: "OPEN",
        dedupKey,
        marketId,
        sourceType: "NEWS",
        generatorVersion: "2.0",
      },
    });

    await ensureAmmStateForEvent(prisma, event.id);
    createdIds.push(event.id);
    console.log(`  ✓ ${i + 1}/${SEED_COUNT} ${marketId} - ${title.slice(0, 50)}...`);
  }

  const finalCount = await prisma.event.count();
  console.log(`\nCreated ${createdIds.length} markets. Total events: ${finalCount}`);

  try {
    const { invalidateTrendingCache } = await import("../lib/cache/trending");
    await invalidateTrendingCache();
    console.log("Trending cache invalidated.");
  } catch (e) {
    console.warn("Could not invalidate trending cache:", e);
  }

  console.log("\n=== DONE. Verify with: GET /api/events ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
