/**
 * HARD RESET + KNOWN-GOOD SEED
 * 1) Counts events and shows sample row
 * 2) Deletes ALL events (and dependent rows in order)
 * 3) Inserts ONE binary (YES/NO) market with LMSR params
 * 4) Verifies: count=1, price returns 0.5
 *
 * Run: npx dotenv -e .env.local -- tsx scripts/hard-reset-and-seed.ts
 * Or:  tsx scripts/hard-reset-and-seed.ts   (uses .env / .env.local via dotenv in app)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getBParameter } from "../lib/pricing/initialization";
import { getPrice } from "../lib/pricing/lmsr";

const prisma = new PrismaClient();

const KNOWN_GOOD_TITLE = "[DEBUG] Mercato binario YES/NO — Hard reset seed";
const KNOWN_GOOD_CATEGORY = "Tecnologia";

async function main() {
  console.log("=== HARD RESET + SEED ===\n");

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
    },
  });

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

  const finalCount = await prisma.event.count();
  console.log("\nEvents count (final):", finalCount);

  try {
    const { invalidateTrendingCache } = await import("../lib/cache/trending");
    await invalidateTrendingCache();
    console.log("Trending cache invalidated.");
  } catch (e) {
    console.warn("Could not invalidate trending cache:", e);
  }

  console.log("\n=== DONE. Verify with: GET /api/health, GET /api/events, GET /api/events/" + event.id + "/price ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
