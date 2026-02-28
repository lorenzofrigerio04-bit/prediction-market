#!/usr/bin/env tsx
/**
 * Azzera TUTTE le interazioni sulla piattaforma:
 * - 0 previsioni (Prediction + Position/Trade AMM)
 * - 0 commenti
 * - 0 like/reazioni (Reaction)
 * - 0 follow eventi (EventFollower)
 * - 0 snapshot probabilità (EventProbabilitySnapshot)
 * - Reset stato AMM (qYes/qNo = 0)
 * - Transazioni legate a trading/simulazione (SHARE_*, PREDICTION_*, SIMULATED_TOPUP)
 * - Notifiche eventi (EVENT_CLOSING_SOON, EVENT_RESOLVED)
 * Opzionale: reset crediti utenti a 100 (--reset-credits).
 *
 * Uso:
 *   npx tsx scripts/reset-predictions-and-comments.ts           # dry-run
 *   npx tsx scripts/reset-predictions-and-comments.ts --force   # esegue
 *   npx tsx scripts/reset-predictions-and-comments.ts --force --reset-credits  # + reset crediti utenti
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACTIVITY_TRANSACTION_TYPES = [
  "PREDICTION_WIN",
  "PREDICTION_LOSS",
  "SHARE_BUY",
  "SHARE_SELL",
  "SHARE_PAYOUT",
  "SIMULATED_TOPUP",
] as const;

const ACTIVITY_NOTIFICATION_TYPES = ["EVENT_CLOSING_SOON", "EVENT_RESOLVED"] as const;

const DEFAULT_CREDITS = 100;
const CREDITS_MICROS_PER_CREDIT = 1_000_000n;
const DEFAULT_CREDITS_MICROS = BigInt(DEFAULT_CREDITS) * CREDITS_MICROS_PER_CREDIT;

async function main() {
  const force = process.argv.includes("--force");
  const resetCredits = process.argv.includes("--reset-credits");

  const [
    predictionsCount,
    commentsCount,
    reactionsCount,
    tradesCount,
    positionsCount,
    followersCount,
    snapshotsCount,
    transactionsActivityCount,
    notificationsActivityCount,
  ] = await Promise.all([
    prisma.prediction.count(),
    prisma.comment.count(),
    prisma.reaction.count(),
    prisma.trade.count(),
    prisma.position.count(),
    prisma.eventFollower.count(),
    prisma.eventProbabilitySnapshot.count(),
    prisma.transaction.count({
      where: { type: { in: [...ACTIVITY_TRANSACTION_TYPES] } },
    }),
    prisma.notification.count({
      where: { type: { in: [...ACTIVITY_NOTIFICATION_TYPES] } },
    }),
  ]);

  const ammStateCount = await prisma.ammState.count();

  console.log("=".repeat(60));
  console.log("Azzera TUTTE le interazioni sulla piattaforma");
  console.log("=".repeat(60));
  console.log();
  console.log("Record da eliminare / azzerare:");
  console.log("  • Previsioni (legacy):     ", predictionsCount);
  console.log("  • Commenti:                ", commentsCount);
  console.log("  • Reazioni (like, ecc.):   ", reactionsCount);
  console.log("  • Trade AMM:               ", tradesCount);
  console.log("  • Position AMM:            ", positionsCount);
  console.log("  • Follow eventi:           ", followersCount);
  console.log("  • Snapshot probabilità:    ", snapshotsCount);
  console.log("  • Transazioni attività:    ", transactionsActivityCount);
  console.log("  • Notifiche eventi:       ", notificationsActivityCount);
  console.log("  • AmmState da resettare:  ", ammStateCount, "(qYes/qNo → 0)");
  if (resetCredits) console.log("  • Utenti: reset crediti a", DEFAULT_CREDITS);
  console.log();

  const total =
    predictionsCount +
    commentsCount +
    reactionsCount +
    tradesCount +
    positionsCount +
    followersCount +
    snapshotsCount +
    transactionsActivityCount +
    notificationsActivityCount;

  if (total === 0 && ammStateCount === 0 && !resetCredits) {
    console.log("Nessuna interazione da rimuovere. Database già pulito.");
    await prisma.$disconnect();
    return;
  }

  if (!force) {
    console.log(
      "Modalità dry-run. Per eseguire: npx tsx scripts/reset-predictions-and-comments.ts --force"
    );
    if (total > 0 && !resetCredits)
      console.log("  Opzionale: aggiungi --reset-credits per riportare i crediti di tutti gli utenti a 100.");
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(async (tx) => {
    const r1 = await tx.reaction.deleteMany({});
    console.log("  ✓ Reazioni eliminate:", r1.count);

    const delReplies = await tx.comment.deleteMany({ where: { parentId: { not: null } } });
    const delRoot = await tx.comment.deleteMany({});
    console.log("  ✓ Commenti eliminati:", delReplies.count + delRoot.count);

    const r2 = await tx.prediction.deleteMany({});
    console.log("  ✓ Previsioni (legacy) eliminate:", r2.count);

    const r3 = await tx.trade.deleteMany({});
    console.log("  ✓ Trade AMM eliminati:", r3.count);

    const r4 = await tx.position.deleteMany({});
    console.log("  ✓ Position AMM eliminate:", r4.count);

    const r5 = await tx.eventFollower.deleteMany({});
    console.log("  ✓ Follow eventi eliminati:", r5.count);

    const r6 = await tx.eventProbabilitySnapshot.deleteMany({});
    console.log("  ✓ Snapshot probabilità eliminati:", r6.count);

    const r7 = await tx.ammState.updateMany({
      data: { qYesMicros: 0n, qNoMicros: 0n },
    });
    console.log("  ✓ AmmState resettati (qYes/qNo=0):", r7.count);

    const r8 = await tx.transaction.deleteMany({
      where: { type: { in: [...ACTIVITY_TRANSACTION_TYPES] } },
    });
    console.log("  ✓ Transazioni attività eliminate:", r8.count);

    const r9 = await tx.notification.deleteMany({
      where: { type: { in: [...ACTIVITY_NOTIFICATION_TYPES] } },
    });
    console.log("  ✓ Notifiche eventi eliminate:", r9.count);

    if (resetCredits) {
      const r10 = await tx.user.updateMany({
        data: {
          credits: DEFAULT_CREDITS,
          creditsMicros: DEFAULT_CREDITS_MICROS,
        },
      });
      console.log("  ✓ Utenti aggiornati (crediti=100):", r10.count);
    }
  });

  console.log();
  console.log("Operazione completata. Interazioni azzerate.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
