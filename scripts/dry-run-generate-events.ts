/**
 * Dry-run script per generazione eventi (BLOCCO 5)
 * 
 * Esegue la pipeline V2 senza pubblicare nel DB.
 * Mostra top 20 candidati che verrebbero creati.
 * 
 * Usage: pnpm dry-run:events
 */

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

import { prisma } from '../lib/prisma';
import { runPipelineV2 } from '../lib/pipeline/runPipelineV2';

async function main() {
  console.log('=== DRY RUN: Generazione Eventi (BLOCCO 5) ===\n');

  try {
    const result = await runPipelineV2({
      prisma,
      now: new Date(),
      dryRun: true,
    });

    console.log('\n--- Risultati Dry Run ---');
    console.log(`Storyline elegibili: ${result.eligibleStorylinesCount}`);
    console.log(`Candidati generati: ${result.candidatesCount}`);
    console.log(`Candidati dopo dedup: ${result.dedupedCandidatesCount}`);
    console.log(`Candidati selezionati: ${result.selectedCount}`);
    console.log(`\nRagioni di scarto:`);
    Object.entries(result.reasonsCount).forEach(([reason, count]) => {
      console.log(`  ${reason}: ${count}`);
    });

    if (result.selectedCount === 0) {
      console.log('\n⚠️  Nessun candidato selezionato. Target già raggiunto o nessun candidato valido.');
      process.exit(0);
    }

    console.log('\n✅ Dry run completato. Nessun evento creato nel DB.');
    console.log(`\nPer creare gli eventi, esegui: pnpm generate-events`);
  } catch (error) {
    console.error('❌ Errore durante dry run:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
