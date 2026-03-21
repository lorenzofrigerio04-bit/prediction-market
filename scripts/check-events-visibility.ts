/**
 * Diagnostica: quanti eventi ci sono in DB e quanti vengono mostrati nel feed.
 * Esegui: npx tsx scripts/check-events-visibility.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const [total, byStatus, bySourceType, openAll, openNews, postsAiImage] = await Promise.all([
    prisma.event.count(),
    prisma.event.groupBy({ by: ["status"], _count: true }),
    prisma.event.groupBy({ by: ["sourceType"], _count: true }),
    prisma.event.count({
      where: { status: "OPEN", closesAt: { gt: now } },
    }),
    prisma.event.count({
      where: { status: "OPEN", closesAt: { gt: now }, sourceType: "NEWS" },
    }),
    prisma.post.count({
      where: {
        type: "AI_IMAGE",
        aiImageUrl: { not: null },
        event: {
          sourceType: "NEWS",
          resolved: false,
          closesAt: { gt: now },
        },
      },
    }),
  ]);

  console.log("\n=== Eventi in DB (visibilità feed) ===\n");
  console.log("Totale eventi:", total);
  console.log("\nPer status:", byStatus.map((x) => `${x.status ?? "null"}: ${x._count}`).join(", "));
  console.log("Per sourceType:", bySourceType.map((x) => `${x.sourceType ?? "null"}: ${x._count}`).join(", "));
  console.log("\nEventi OPEN e non scaduti (closesAt > now):", openAll);
  console.log("  → di cui sourceType = NEWS (quelli mostrati in Home/Esplora):", openNews);
  console.log("\nPost AI_IMAGE con evento NEWS aperto (mostrati in Discover):", postsAiImage);

  if (openNews === 0 && total > 0) {
    console.log("\n⚠️  Il feed mostra solo eventi con sourceType = NEWS.");
    console.log("   Gli eventi in DB hanno un altro sourceType o null: non compaiono in home/sport.");
  }
  if (openNews === 0) {
    console.log("\n→ Esegui 'Generazione eventi' dall’admin per creare eventi NEWS.");
  }
  console.log("");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
