/**
 * Controlla quali eventi passano il filtro del feed home (resolved=false, closesAt>now, non HIDDEN).
 * Uso: npx tsx scripts/check-feed-events.ts
 */
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const all = await prisma.event.findMany({
    where: {},
    select: {
      id: true,
      title: true,
      sourceType: true,
      resolved: true,
      closesAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 35,
  });

  const wouldShow = all.filter(
    (e) =>
      e.resolved === false &&
      e.closesAt > now &&
      (e.sourceType === null || e.sourceType !== "HIDDEN")
  );

  console.log("Now (server):", now.toISOString());
  console.log("\nUltimi 35 eventi (createdAt desc):");
  console.log("  ID (short) | sourceType | resolved | closesAt           | createdAt           | in feed?");
  for (const e of all) {
    const inFeed =
      e.resolved === false &&
      e.closesAt > now &&
      (e.sourceType === null || e.sourceType !== "HIDDEN");
    console.log(
      `  ${e.id.slice(0, 8)}... | ${String(e.sourceType ?? "null").padEnd(9)} | ${String(e.resolved).padEnd(8)} | ${e.closesAt.toISOString().slice(0, 16)} | ${e.createdAt.toISOString().slice(0, 16)} | ${inFeed ? "SÌ" : "no"}`
    );
  }
  console.log("\nEventi che passano il filtro feed (resolved=false, closesAt>now, non HIDDEN):", wouldShow.length);
  console.log("Totale eventi considerati:", all.length);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
