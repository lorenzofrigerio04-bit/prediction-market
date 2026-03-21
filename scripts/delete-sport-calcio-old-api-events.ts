/**
 * Elimina gli eventi Calcio (pagina Sport) generati con la vecchia API (TheSportsDB).
 * Criteri: category = Calcio, sourceType = SPORT, footballDataMatchId IS NULL
 * (oppure resolutionAuthorityHost = 'www.thesportsdb.com').
 *
 * Uso:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/delete-sport-calcio-old-api-events.ts --dry   (solo conteggio)
 *   CONFIRM_DELETE=1 npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/delete-sport-calcio-old-api-events.ts
 */

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error", "warn"] });

async function main() {
  const dryRun = process.argv.includes("--dry");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL non configurato.");
    process.exit(1);
  }

  const where = {
    category: "Calcio",
    sourceType: "SPORT",
    OR: [
      { footballDataMatchId: null },
      { resolutionAuthorityHost: "www.thesportsdb.com" },
      { sourceStorylineId: { startsWith: "thesportsdb:" } },
    ],
  };

  const toDelete = await prisma.event.findMany({
    where,
    select: { id: true, title: true, resolutionAuthorityHost: true, footballDataMatchId: true },
    orderBy: { createdAt: "desc" },
  });

  console.log("Eventi Calcio (Sport) dalla vecchia API trovati:", toDelete.length);
  toDelete.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.title?.slice(0, 50)}... (${e.resolutionAuthorityHost ?? "—"}, matchId=${e.footballDataMatchId ?? "null"})`);
  });

  if (toDelete.length === 0) {
    console.log("Nessun evento da eliminare.");
    process.exit(0);
  }

  if (dryRun) {
    console.log("\n[DRY RUN] Nessuna eliminazione. Per eliminare: CONFIRM_DELETE=1 npx ts-node ... scripts/delete-sport-calcio-old-api-events.ts");
    process.exit(0);
  }

  if (process.env.CONFIRM_DELETE !== "1") {
    console.error("\nImposta CONFIRM_DELETE=1 per confermare l'eliminazione.");
    process.exit(1);
  }

  const ids = toDelete.map((e) => e.id);
  const result = await prisma.event.deleteMany({ where: { id: { in: ids } } });
  console.log(`\nEliminati ${result.count} eventi.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
