/**
 * Verifica quali eventi aperti vede il DB (stesso che usa l'app quando giri in locale).
 * Esegui: npx tsx scripts/check-events-list.ts
 * Se qui vedi i 5 eventi ma sul sito no, stai guardando un sito che usa un altro DB (es. produzione).
 */

import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const now = new Date();

  const events = await prisma.event.findMany({
    where: { resolved: false, closesAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: { id: true, title: true, createdAt: true, category: true },
  });

  console.log("Eventi aperti nel DB (ordine: più recenti prima):");
  console.log("Totale:", events.length, "\n");
  events.forEach((e, i) => {
    console.log(`${i + 1}. [${e.category}] ${e.title.slice(0, 60)}${e.title.length > 60 ? "…" : ""}`);
    console.log(`   id: ${e.id}  createdAt: ${e.createdAt.toISOString()}`);
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
