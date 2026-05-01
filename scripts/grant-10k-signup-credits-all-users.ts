/**
 * One-shot: imposta per tutti gli utenti 10.000 crediti virtuali (campo legacy + micros AMM).
 * Esegui dopo `prisma db push` o migrate se aggiorni gli default in schema:
 *
 *   npx tsx scripts/grant-10k-signup-credits-all-users.ts
 */
import { prisma } from "../lib/prisma";
import { CREDITS_SCALE } from "../lib/credits-config";

async function main() {
  const credits = 10_000;
  const creditsMicros = BigInt(credits) * BigInt(CREDITS_SCALE);

  const result = await prisma.user.updateMany({
    data: {
      credits,
      creditsMicros,
    },
  });

  console.log(`Aggiornati ${result.count} utenti: credits=${credits}, creditsMicros=${creditsMicros}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
