/**
 * Script per aggiornare dati esistenti dopo la migration
 * Esegue le query SQL necessarie per sincronizzare amount/credits e shop_items.type
 */

import { prisma } from "../lib/prisma";

async function main() {
  console.log("🔄 Aggiornamento dati esistenti dopo migration...\n");

  try {
    // 1. Copia credits in amount per predictions esistenti
    console.log("1️⃣  Aggiornamento predictions.amount da credits...");
    const predictionsUpdated = await prisma.$executeRaw`
      UPDATE predictions 
      SET amount = credits 
      WHERE amount = 0 OR amount IS NULL
    `;
    console.log(`   ✅ ${predictionsUpdated} predictions aggiornate\n`);

    // 2. Verifica sincronizzazione amount/credits
    console.log("2️⃣  Verifica sincronizzazione amount/credits...");
    const mismatches = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM predictions 
      WHERE amount != credits AND amount IS NOT NULL AND credits IS NOT NULL
    `;
    const mismatchCount = Number(mismatches[0]?.count || 0);
    if (mismatchCount > 0) {
      console.log(`   ⚠️  ATTENZIONE: ${mismatchCount} predictions con amount != credits`);
      console.log("   Verificare manualmente queste righe.\n");
    } else {
      console.log("   ✅ Tutte le predictions hanno amount = credits\n");
    }

    // 3. Aggiorna type per shop_items esistenti
    console.log("3️⃣  Aggiornamento shop_items.type...");
    const shopItemsUpdated = await prisma.$executeRaw`
      UPDATE shop_items 
      SET type = 'CREDIT_BUNDLE' 
      WHERE type IS NULL OR type = ''
    `;
    console.log(`   ✅ ${shopItemsUpdated} shop items aggiornati\n`);

    // 4. Verifica shop_items.type
    console.log("4️⃣  Verifica shop_items.type...");
    const shopTypes = await prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
      SELECT type, COUNT(*) as count
      FROM shop_items
      GROUP BY type
    `;
    console.log("   Tipi trovati:");
    shopTypes.forEach(({ type, count }) => {
      console.log(`   - ${type || "(NULL)"}: ${count} item(s)`);
    });
    console.log("");

    console.log("✅ Aggiornamento dati completato con successo!");
  } catch (error) {
    console.error("❌ Errore durante l'aggiornamento:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
