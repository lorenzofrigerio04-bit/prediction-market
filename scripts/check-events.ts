import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.event.count();
  console.log(`📊 Totale eventi nel database: ${count}`);

  if (count > 0) {
    const events = await prisma.event.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        closesAt: true,
      },
    });
    console.log("\n📋 Eventi trovati:");
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (${event.category})`);
      console.log(`   Chiude il: ${event.closesAt.toLocaleDateString("it-IT")}`);
    });
  }
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
