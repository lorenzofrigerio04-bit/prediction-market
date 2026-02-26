/**
 * Allinea creditsMicros al saldo credits per utenti che hanno creditsMicros = 0
 * (es. creati prima dell'introduzione del saldo unificato o da OAuth).
 * Dopo questo script, il saldo mostrato ovunque (getDisplayCredits) sarà coerente.
 *
 * Uso: npx tsx scripts/backfill-credits-micros.ts
 * Dry-run: npx tsx scripts/backfill-credits-micros.ts --dry
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SCALE = 1_000_000n;

async function main() {
  const dryRun = process.argv.includes("--dry");
  if (dryRun) console.log("(dry-run: nessuna modifica al DB)\n");

  const users = await prisma.user.findMany({
    where: { creditsMicros: 0 },
    select: { id: true, email: true, name: true, credits: true },
  });

  if (users.length === 0) {
    console.log("Nessun utente con creditsMicros = 0. Nessuna azione.");
    return;
  }

  console.log(`Trovati ${users.length} utenti con creditsMicros = 0 da allineare.\n`);

  for (const u of users) {
    const newMicros = BigInt(u.credits) * SCALE;
    console.log(`  ${u.email ?? u.id}: credits=${u.credits} → creditsMicros=${newMicros}`);
    if (!dryRun) {
      await prisma.user.update({
        where: { id: u.id },
        data: { creditsMicros: newMicros },
      });
    }
  }

  if (!dryRun) {
    console.log(`\n✅ Aggiornati ${users.length} utenti.`);
  } else {
    console.log("\n(dry-run) Esegui senza --dry per applicare le modifiche.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
