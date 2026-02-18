/**
 * Script per generazione eventi (BLOCCO 5)
 * 
 * Esegue la pipeline V2 completa e pubblica eventi nel DB.
 * 
 * Usage: pnpm generate-events
 */

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

import { prisma } from '../lib/prisma';
import { runPipelineV2 } from '../lib/pipeline/runPipelineV2';

async function main() {
  console.log('=== Generazione Eventi (BLOCCO 5) ===\n');

  try {
    const result = await runPipelineV2({
      prisma,
      now: new Date(),
      dryRun: false,
    });

    console.log('\n--- Risultati ---');
    console.log(`Storyline elegibili: ${result.eligibleStorylinesCount}`);
    console.log(`Candidati generati: ${result.candidatesCount}`);
    console.log(`Candidati dopo dedup: ${result.dedupedCandidatesCount}`);
    console.log(`Candidati selezionati: ${result.selectedCount}`);
    console.log(`Eventi creati: ${result.createdCount}`);
    console.log(`Eventi saltati: ${result.skippedCount}`);
    
    if (Object.keys(result.reasonsCount).length > 0) {
      console.log(`\nRagioni di scarto:`);
      Object.entries(result.reasonsCount).forEach(([reason, count]) => {
        console.log(`  ${reason}: ${count}`);
      });
    }

    if (result.createdCount > 0) {
      console.log(`\n✅ Creati ${result.createdCount} eventi nel DB.`);
      process.exit(0);
    } else {
      console.log('\n⚠️  Nessun evento creato.');
      if (result.selectedCount === 0) {
        console.log('   Target già raggiunto o nessun candidato valido.');
      } else {
        console.log('   Tutti i candidati sono stati saltati (vedi ragioni sopra).');
      }
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Errore durante generazione eventi:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
