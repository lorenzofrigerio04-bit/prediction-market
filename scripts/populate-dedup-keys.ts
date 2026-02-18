/**
 * Script per popolare dedupKey per eventi esistenti
 * 
 * Esegui questo script PRIMA di applicare la migrazione Prisma che aggiunge
 * il constraint unique su dedupKey.
 * 
 * Usage: pnpm tsx scripts/populate-dedup-keys.ts
 */

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

import { prisma } from '../lib/prisma';
import { generateDedupKey } from '../lib/event-publishing/dedup';

async function main() {
  console.log('=== Popolazione dedupKey per eventi esistenti ===\n');

  try {
    // Trova tutti gli eventi senza dedupKey o con dedupKey null
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { dedupKey: null },
          { dedupKey: '' },
        ],
      },
      select: {
        id: true,
        title: true,
        closesAt: true,
        resolutionAuthorityHost: true,
        dedupKey: true,
      },
    });

    console.log(`Trovati ${events.length} eventi senza dedupKey\n`);

    if (events.length === 0) {
      console.log('✅ Nessun evento da aggiornare.');
      return;
    }

    // Popola dedupKey per ogni evento
    let updated = 0;
    let skipped = 0;
    const duplicates: string[] = [];

    for (const event of events) {
      try {
        const dedupKey = generateDedupKey(
          event.title,
          event.closesAt,
          event.resolutionAuthorityHost || ''
        );

        // Verifica se questo dedupKey esiste già
        const existing = await prisma.event.findFirst({
          where: {
            dedupKey,
            id: { not: event.id },
          },
        });

        if (existing) {
          console.warn(`⚠️  Duplicato trovato per evento ${event.id}: "${event.title}"`);
          console.warn(`   DedupKey già presente su evento ${existing.id}`);
          duplicates.push(event.id);
          skipped++;
          continue;
        }

        // Aggiorna evento con dedupKey
        await prisma.event.update({
          where: { id: event.id },
          data: { dedupKey },
        });

        updated++;
        if (updated % 10 === 0) {
          console.log(`   Aggiornati ${updated}/${events.length} eventi...`);
        }
      } catch (error: any) {
        console.error(`❌ Errore aggiornando evento ${event.id}:`, error.message);
        skipped++;
      }
    }

    console.log(`\n✅ Completato:`);
    console.log(`   Aggiornati: ${updated}`);
    console.log(`   Saltati: ${skipped}`);

    if (duplicates.length > 0) {
      console.log(`\n⚠️  ${duplicates.length} eventi con dedupKey duplicati trovati:`);
      console.log(`   Devi risolvere manualmente questi duplicati prima di applicare il constraint unique.`);
      console.log(`   Event IDs: ${duplicates.join(', ')}`);
      process.exit(1);
    }

    console.log(`\n✅ Ora puoi applicare la migrazione Prisma con: pnpm db:push`);
  } catch (error) {
    console.error('❌ Errore:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
