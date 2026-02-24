/**
 * HARD RESET + KNOWN-GOOD SEED
 * 1) Counts events and shows sample row
 * 2) Deletes ALL events (and dependent rows in order)
 * 3) Inserts ONE binary (YES/NO) market with LMSR params
 * 4) Optionally creates N starter-pack markets (--starter-pack=N, default 0)
 * 5) Verifies and prints summary
 *
 * Usage:
 *   npx dotenv -e .env.local -- tsx scripts/hard-reset-and-seed.ts
 *   npx dotenv -e .env.local -- tsx scripts/hard-reset-and-seed.ts --starter-pack=10
 *   tsx scripts/hard-reset-and-seed.ts --starter-pack=5
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getBParameter } from "../lib/pricing/initialization";
import { getPrice } from "../lib/pricing/lmsr";
import { getBufferHoursForCategory } from "../lib/markets";
import type { Category } from "../lib/pricing/initialization";
import { ensureAmmStateForEvent } from "../lib/amm/ensure-amm-state";

const prisma = new PrismaClient();

/** Parse --starter-pack=N from process.argv. Default 0. */
function parseStarterPack(): number {
  const arg = process.argv.find((a) => a.startsWith("--starter-pack="));
  if (!arg) return 0;
  const n = parseInt(arg.split("=")[1] ?? "0", 10);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

const KNOWN_GOOD_TITLE = "[DEBUG] Mercato binario YES/NO — Hard reset seed";
const KNOWN_GOOD_CATEGORY = "Tecnologia";

/** Categories for starter pack: sport, tech, crypto (Economia), meteo (Scienza), entertainment. */
const STARTER_PACK_CATEGORIES: Category[] = [
  "Sport",
  "Tecnologia",
  "Economia",
  "Scienza",
  "Intrattenimento",
];

/** Real-looking titles (no [DEBUG]) per category. */
const STARTER_PACK_TITLES: Record<Category, string[]> = {
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
  Politica: [],
  Cultura: [],
};

/** Compute q_yes, q_no so that LMSR price for YES equals pInit (with q_yes,q_no baseline). */
function quantitiesForPInit(pInit: number, b: number): { q_yes: number; q_no: number } {
  if (pInit <= 0 || pInit >= 1) return { q_yes: 0, q_no: 0 };
  if (Math.abs(pInit - 0.5) < 0.001) return { q_yes: 0, q_no: 0 };
  if (pInit > 0.5) {
    const q_yes = b * Math.log(pInit / (1 - pInit));
    return { q_yes, q_no: 0 };
  }
  const q_no = b * Math.log((1 - pInit) / pInit);
  return { q_yes: 0, q_no };
}

/** Pick random in [min, max] (hours). */
function randomHours(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Pick random p_init in [0.35, 0.65] with 2 decimals. */
function randomPInit(): number {
  return Math.round((0.35 + Math.random() * 0.3) * 100) / 100;
}

async function main() {
  const starterPackCount = parseStarterPack();
  console.log("=== HARD RESET + SEED ===\n");
  if (starterPackCount > 0) {
    console.log("Starter pack requested:", starterPackCount, "markets\n");
  }

  // ---- STEP 1: DB truth ----
  const dbUrl = process.env.DATABASE_URL ?? "";
  const dbHost = dbUrl.includes("@") ? dbUrl.split("@")[1]?.split("/")[0] : "unknown";
  console.log("DB host (from DATABASE_URL):", dbHost ? `${dbHost.slice(0, 30)}...` : "NOT SET");
  console.log("");

  const beforeCount = await prisma.event.count();
  console.log("Events count (before reset):", beforeCount);

  if (beforeCount > 0) {
    const sample = await prisma.event.findFirst({
      select: {
        id: true,
        title: true,
        p_init: true,
        b: true,
        q_yes: true,
        q_no: true,
        closesAt: true,
        resolved: true,
        realWorldEventTime: true,
        resolutionStatus: true,
      },
    });
    console.log("Sample row:", JSON.stringify(sample, null, 2));
  }
  console.log("");

  // ---- STEP 2: Delete in order (avoid FK violations) ----
  console.log("Deleting dependent rows then events...");

  const deletedPredictions = await prisma.prediction.deleteMany({});
  const deletedComments = await prisma.comment.deleteMany({});
  const deletedFollowers = await prisma.eventFollower.deleteMany({});
  const deletedMetrics = await prisma.marketMetrics.deleteMany({});
  const deletedAnalytics = await prisma.marketAnalyticsRaw.deleteMany({});
  const deletedEvents = await prisma.event.deleteMany({});

  console.log(
    "Deleted:",
    deletedPredictions.count,
    "predictions,",
    deletedComments.count,
    "comments,",
    deletedFollowers.count,
    "followers,",
    deletedMetrics.count,
    "market_metrics,",
    deletedAnalytics.count,
    "market_analytics_raw,",
    deletedEvents.count,
    "events"
  );

  const afterDeleteCount = await prisma.event.count();
  console.log("Events count (after delete):", afterDeleteCount);
  if (afterDeleteCount !== 0) {
    throw new Error("Expected 0 events after delete");
  }
  console.log("");

  // ---- STEP 3: Get system user for createdById ----
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
  const marketCloseTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const realWorldEventTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const b = getBParameter(KNOWN_GOOD_CATEGORY, "Medium");
  const p_init = 0.5;
  const q_yes = 0;
  const q_no = 0;

  const event = await prisma.event.create({
    data: {
      title: KNOWN_GOOD_TITLE,
      description: "Mercato binario creato dallo script hard-reset-and-seed. p_init=0.5, b=" + b + ", q_yes=q_no=0.",
      category: KNOWN_GOOD_CATEGORY,
      closesAt: marketCloseTime,
      realWorldEventTime,
      resolutionTimeExpected: realWorldEventTime,
      resolutionBufferHours: 24,
      resolutionStatus: "PENDING",
      resolutionSourceUrl: "https://example.com/resolution",
      resolutionNotes: "Risoluzione manuale o da fonte.",
      createdById: systemUser.id,
      p_init,
      b,
      q_yes,
      q_no,
      tradingMode: "AMM",
    },
  });
  await ensureAmmStateForEvent(prisma, event.id);

  console.log("Inserted known-good event:");
  console.log("  id:", event.id);
  console.log("  title:", event.title);
  console.log("  closesAt:", event.closesAt.toISOString());
  console.log("  realWorldEventTime:", event.realWorldEventTime?.toISOString());
  console.log("  p_init:", event.p_init, "b:", event.b, "q_yes:", event.q_yes, "q_no:", event.q_no);

  const probability = getPrice(event.q_yes ?? 0, event.q_no ?? 0, event.b ?? 100, "YES") * 100;
  console.log("  LMSR probability (YES):", probability, "%");
  if (Math.abs(probability - 50) > 0.01) {
    throw new Error("Expected initial probability 50%, got " + probability);
  }

  // ---- STEP 4: Optional starter pack ----
  const starterPackIds: string[] = [];
  if (starterPackCount > 0) {
    console.log("\n--- Starter pack: creating", starterPackCount, "markets ---");
    const now = new Date();
    const titlesByCategory: Record<string, string[]> = {};
    for (const cat of STARTER_PACK_CATEGORIES) {
      titlesByCategory[cat] = [...(STARTER_PACK_TITLES[cat] ?? [])];
    }
    for (let i = 0; i < starterPackCount; i++) {
      const category = STARTER_PACK_CATEGORIES[i % STARTER_PACK_CATEGORIES.length];
      const pool = titlesByCategory[category];
      const title = pool.length > 0 ? pool[i % pool.length]! : `Mercato ${category} #${i + 1}`;
      const closeInHours = randomHours(2, 72);
      const bufferHours = getBufferHoursForCategory(category);
      const marketCloseTime = new Date(now.getTime() + closeInHours * 60 * 60 * 1000);
      const realWorldEventTime = new Date(
        marketCloseTime.getTime() + (bufferHours + 1) * 60 * 60 * 1000
      );
      const b = getBParameter(category, "Medium");
      const p_init = randomPInit();
      const { q_yes, q_no } = quantitiesForPInit(p_init, b);

      const e = await prisma.event.create({
        data: {
          title,
          description: `Mercato starter pack (${category}). Chiusura tra ${Math.round(closeInHours)}h.`,
          category,
          closesAt: marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected: realWorldEventTime,
          resolutionBufferHours: bufferHours,
          resolutionStatus: "PENDING",
          resolutionSourceUrl: "https://example.com/resolution",
          resolutionNotes: "Risoluzione da fonte ufficiale.",
          createdById: systemUser!.id,
          p_init,
          b,
          q_yes,
          q_no,
          tradingMode: "AMM",
        },
      });
      await ensureAmmStateForEvent(prisma, e.id);
      starterPackIds.push(e.id);
    }
    console.log("Starter pack created:", starterPackIds.length, "markets.");
  }

  const finalCount = await prisma.event.count();
  console.log("\nEvents count (final):", finalCount);

  try {
    const { invalidateTrendingCache } = await import("../lib/cache/trending");
    await invalidateTrendingCache();
    console.log("Trending cache invalidated.");
  } catch (e) {
    console.warn("Could not invalidate trending cache:", e);
  }

  // ---- Summary ----
  console.log("\n=== SUMMARY ===");
  console.log("Known-good event id:", event.id);
  if (starterPackCount > 0) {
    console.log("Starter pack created:", starterPackIds.length);
    console.log("Sample IDs:", starterPackIds.slice(0, 5).join(", "));
    if (starterPackIds.length > 5) {
      console.log("(all IDs:", starterPackIds.join(", ") + ")");
    }
  }
  console.log("\n=== DONE. Verify with: GET /api/health, GET /api/events, GET /api/events/" + event.id + "/price ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
