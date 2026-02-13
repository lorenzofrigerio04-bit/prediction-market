import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Trova l'evento Bitcoin
  const bitcoinEvent = await prisma.event.findFirst({
    where: {
      title: {
        contains: "Bitcoin",
      },
    },
  });

  if (!bitcoinEvent) {
    console.log("❌ Evento Bitcoin non trovato");
    return;
  }

  // Imposta la chiusura a 2 minuti da ora
  const twoMinutesFromNow = new Date();
  twoMinutesFromNow.setMinutes(twoMinutesFromNow.getMinutes() + 2);

  const updated = await prisma.event.update({
    where: {
      id: bitcoinEvent.id,
    },
    data: {
      closesAt: twoMinutesFromNow,
    },
  });

  console.log(`✅ Evento Bitcoin aggiornato:`);
  console.log(`   Titolo: ${updated.title}`);
  console.log(`   Chiude il: ${updated.closesAt.toLocaleString("it-IT")}`);
  console.log(`   Tra: ${Math.floor((updated.closesAt.getTime() - Date.now()) / 1000 / 60)} minuti`);
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
