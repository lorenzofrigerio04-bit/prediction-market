/**
 * Rimuove tutta l'attività dei bot e riparte da zero per test manuali.
 *
 * 1. Trova tutti gli utenti con role BOT
 * 2. Elimina tutte le Prediction create da bot
 * 3. Elimina le Transaction collegate (referenceType "prediction", referenceId = prediction id)
 * 4. Per ogni evento che aveva previsioni bot: ricalcola stato da sole previsioni umane rimanenti
 *    (q_yes, q_no, probability, yesCredits, noCredits, totalCredits, yesPredictions, noPredictions).
 *    Se non resta nessuna previsione: azzera tutto (0/0, 50%, 0 crediti).
 * 5. Resetta crediti e statistiche dei bot (credits = BOT_INITIAL_CREDITS, totalSpent/totalEarned/totalPredictions/correctPredictions/accuracy a 0).
 *
 * Uso: DATABASE_URL="..." npx tsx scripts/remove-bot-activity.ts
 * Richiede conferma (--yes per saltare).
 */

import { PrismaClient } from "@prisma/client";
import { getEventProbability } from "../lib/pricing/price-display";
import { BOT_INITIAL_CREDITS } from "../lib/simulated-activity/config";

const prisma = new PrismaClient();

async function main() {
  const skipConfirm = process.argv.includes("--yes");
  if (!skipConfirm) {
    console.log("Questo script eliminerà TUTTE le previsioni dei bot e ricalcolerà gli eventi.");
    console.log("I bot avranno di nuovo", BOT_INITIAL_CREDITS, "crediti. Procedere? (scrivi 'sì' per confermare)");
    const readline = await import("readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>((resolve) => rl.question("> ", resolve));
    rl.close();
    if (answer?.toLowerCase() !== "sì" && answer?.toLowerCase() !== "si") {
      console.log("Operazione annullata.");
      process.exit(0);
    }
  }

  const bots = await prisma.user.findMany({
    where: { role: "BOT" },
    select: { id: true },
  });
  const botIds = bots.map((b) => b.id);
  console.log("Bot trovati:", botIds.length);

  if (botIds.length === 0) {
    console.log("Nessun bot. Fine.");
    return;
  }

  const botPredictions = await prisma.prediction.findMany({
    where: { userId: { in: botIds } },
    select: { id: true, eventId: true },
  });
  const botPredictionIds = botPredictions.map((p) => p.id);
  const affectedEventIds = [...new Set(botPredictions.map((p) => p.eventId))];
  console.log("Previsioni bot da eliminare:", botPredictionIds.length);
  console.log("Eventi da ricalcolare:", affectedEventIds.length);

  // Elimina transazioni collegate alle previsioni bot
  const deletedTx = await prisma.transaction.deleteMany({
    where: {
      referenceType: "prediction",
      referenceId: { in: botPredictionIds },
    },
  });
  console.log("Transazioni eliminate:", deletedTx.count);

  // Elimina le previsioni bot
  const deletedPred = await prisma.prediction.deleteMany({
    where: { id: { in: botPredictionIds } },
  });
  console.log("Previsioni eliminate:", deletedPred.count);

  // Ricalcola stato per ogni evento che aveva previsioni bot
  for (const eventId of affectedEventIds) {
    const remaining = await prisma.prediction.findMany({
      where: { eventId },
      select: {
        outcome: true,
        credits: true,
        sharesYes: true,
        sharesNo: true,
      },
    });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { b: true },
    });
    const bVal = event?.b ?? 100;

    if (remaining.length === 0) {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          q_yes: 0,
          q_no: 0,
          probability: 50,
          yesCredits: 0,
          noCredits: 0,
          totalCredits: 0,
          yesPredictions: 0,
          noPredictions: 0,
        },
      });
      continue;
    }

    let qYes = 0;
    let qNo = 0;
    let yesCredits = 0;
    let noCredits = 0;
    let yesPredictions = 0;
    let noPredictions = 0;

    for (const p of remaining) {
      if (p.outcome === "YES") {
        yesPredictions++;
        yesCredits += p.credits;
        qYes += p.sharesYes ?? 0;
      } else {
        noPredictions++;
        noCredits += p.credits;
        qNo += p.sharesNo ?? 0;
      }
    }

    const totalCredits = yesCredits + noCredits;
    const probability = getEventProbability({ q_yes: qYes, q_no: qNo, b: bVal });

    await prisma.event.update({
      where: { id: eventId },
      data: {
        q_yes: qYes,
        q_no: qNo,
        probability,
        yesCredits,
        noCredits,
        totalCredits,
        yesPredictions,
        noPredictions,
      },
    });
  }
  console.log("Eventi ricalcolati.");

  // Resetta crediti e statistiche dei bot
  await prisma.user.updateMany({
    where: { id: { in: botIds } },
    data: {
      credits: BOT_INITIAL_CREDITS,
      totalEarned: 0,
      totalSpent: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      accuracy: 0,
    },
  });
  console.log("Bot resettati: credits =", BOT_INITIAL_CREDITS, ", statistiche azzerate.");

  // Opzionale: elimina commenti/reazioni/follow dei bot per un reset completo
  const deletedComments = await prisma.comment.deleteMany({
    where: { userId: { in: botIds } },
  });
  const deletedReactions = await prisma.reaction.deleteMany({
    where: { userId: { in: botIds } },
  });
  const deletedFollows = await prisma.eventFollower.deleteMany({
    where: { userId: { in: botIds } },
  });
  console.log("Commenti bot eliminati:", deletedComments.count);
  console.log("Reazioni bot eliminate:", deletedReactions.count);
  console.log("Follow bot eliminati:", deletedFollows.count);

  console.log("Fatto. Puoi testare manualmente il sistema da zero.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
