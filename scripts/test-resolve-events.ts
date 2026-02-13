import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifica stato eventi chiusi...\n");

  // Trova eventi chiusi ma non risolti
  const now = new Date();
  const closedEvents = await prisma.event.findMany({
    where: {
      closesAt: {
        lte: now,
      },
      resolved: false,
    },
    include: {
      predictions: {
        include: {
          user: {
            select: {
              email: true,
              credits: true,
            },
          },
        },
      },
    },
  });

  console.log(`📊 Eventi chiusi ma non risolti: ${closedEvents.length}\n`);

  if (closedEvents.length > 0) {
    for (const event of closedEvents) {
      console.log(`📅 ${event.title}`);
      console.log(`   Chiude il: ${event.closesAt.toLocaleString("it-IT")}`);
      console.log(`   Previsioni: ${event.predictions.length}`);
      console.log(`   Crediti totali: ${event.totalCredits}`);
      console.log(`   YES: ${event.yesCredits}, NO: ${event.noCredits}`);
      console.log("");
    }

    console.log("💡 Per risolvere questi eventi:");
    console.log("   1. Chiama POST /api/events/resolve-closed");
    console.log("   2. Oppure risolvi manualmente: POST /api/events/resolve/[eventId]");
  } else {
    console.log("✅ Tutti gli eventi chiusi sono già stati risolti!");
  }

  // Mostra statistiche eventi risolti
  const resolvedEvents = await prisma.event.count({
    where: { resolved: true },
  });

  const activeEvents = await prisma.event.count({
    where: { resolved: false },
  });

  console.log("\n📈 Statistiche:");
  console.log(`   Eventi attivi: ${activeEvents}`);
  console.log(`   Eventi risolti: ${resolvedEvents}`);
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
