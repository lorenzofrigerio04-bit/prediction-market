import { PrismaClient } from "@prisma/client";
import { CREDIT_TRANSACTION_TYPES } from "../lib/credits-config";

const prisma = new PrismaClient();

const SCALE = 1_000_000n; // 1 credito = 1_000_000 micros (AMM)

/**
 * Ricarica crediti a un utente per email.
 * Aggiorna sia credits (legacy/UI) sia creditsMicros (AMM).
 *
 * Uso:
 *   npx tsx scripts/reload-credits.ts <email> [importo]
 *
 * Esempio:
 *   npx tsx scripts/reload-credits.ts lorenzofrigerio04@gmail.com 100000
 */

async function reloadCredits(email: string, amount: number) {
  if (amount < 1) {
    console.error("❌ L'importo deve essere almeno 1.");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, credits: true, creditsMicros: true },
    });

    if (!user) {
      console.error(`❌ Utente con email "${email}" non trovato`);
      process.exit(1);
    }

    const addMicros = BigInt(amount) * SCALE;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          credits: { increment: amount },
          creditsMicros: { increment: addMicros },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: CREDIT_TRANSACTION_TYPES.ADMIN_ADJUSTMENT,
          amount,
          referenceType: "reload_credits",
        },
      }),
    ]);

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true, creditsMicros: true },
    });

    console.log(`✅ Ricaricati ${amount.toLocaleString("it-IT")} crediti a ${email}`);
    console.log(`   Nome: ${user.name || "N/A"}`);
    console.log(`   Nuovo saldo crediti: ${updated?.credits?.toLocaleString("it-IT") ?? "—"}`);
    console.log(`   creditsMicros: ${updated?.creditsMicros?.toString() ?? "—"}`);
  } catch (error) {
    console.error("❌ Errore:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
const amountArg = process.argv[3];
const amount = amountArg ? parseInt(amountArg, 10) : 100_000;

if (!email) {
  console.error("❌ Errore: Devi fornire l'email dell'utente");
  console.log("\nUso: npx tsx scripts/reload-credits.ts <email> [importo]");
  console.log("Esempio: npx tsx scripts/reload-credits.ts lorenzofrigerio04@gmail.com 100000");
  process.exit(1);
}

if (Number.isNaN(amount) || amount < 1) {
  console.error("❌ L'importo deve essere un numero positivo");
  process.exit(1);
}

reloadCredits(email, amount);
