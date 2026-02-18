#!/usr/bin/env tsx
/**
 * Script per eliminare tutti i dati correlati agli eventi
 * 
 * Questo script elimina:
 * - Tutti gli eventi (cascata elimina: Comment, Prediction, EventFollower)
 * - Transazioni correlate agli eventi (via referenceId)
 * - Notifiche correlate agli eventi (via data JSON)
 * - AuditLog relativi agli eventi (via entityType='event')
 * 
 * Uso:
 *   npm run purge              # Esegue in modalità dry-run (preview)
 *   npm run purge -- --force   # Esegue l'eliminazione effettiva
 *   npm run purge -- --dry-run # Esplicita modalità dry-run
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PurgeStats {
  events: number;
  comments: number;
  predictions: number;
  eventFollowers: number;
  transactions: number;
  notifications: number;
  auditLogs: number;
}

/**
 * Conta tutti i record che verranno eliminati
 */
export async function countRecordsToDelete(client: PrismaClient = prisma): Promise<PurgeStats> {
  const [events, transactions, notifications, auditLogs] = await Promise.all([
    client.event.count(),
    client.transaction.count({
      where: {
        type: {
          in: ['PREDICTION_WIN', 'PREDICTION_LOSS'],
        },
      },
    }),
    client.notification.count({
      where: {
        type: {
          in: ['EVENT_CLOSING_SOON', 'EVENT_RESOLVED'],
        },
      },
    }),
    client.auditLog.count({
      where: {
        entityType: 'event',
      },
    }),
  ]);

  // Le relazioni cascade vengono eliminate automaticamente, quindi contiamo solo per logging
  const [comments, predictions, eventFollowers] = await Promise.all([
    client.comment.count(),
    client.prediction.count(),
    client.eventFollower.count(),
  ]);

  return {
    events,
    comments,
    predictions,
    eventFollowers,
    transactions,
    notifications,
    auditLogs,
  };
}

/**
 * Elimina tutti i dati correlati agli eventi
 */
export async function purgeAllData(client: PrismaClient = prisma): Promise<PurgeStats> {
  console.log('🚀 Inizio eliminazione dati...\n');

  const stats: PurgeStats = {
    events: 0,
    comments: 0,
    predictions: 0,
    eventFollowers: 0,
    transactions: 0,
    notifications: 0,
    auditLogs: 0,
  };

  // Usa una transazione per garantire atomicità
  await client.$transaction(async (tx) => {
    // 1. Elimina AuditLog relativi agli eventi
    const deletedAuditLogs = await tx.auditLog.deleteMany({
      where: {
        entityType: 'event',
      },
    });
    stats.auditLogs = deletedAuditLogs.count;
    console.log(`  ✓ Eliminati ${stats.auditLogs} AuditLog relativi agli eventi`);

    // 2. Elimina Notifiche relative agli eventi
    const deletedNotifications = await tx.notification.deleteMany({
      where: {
        type: {
          in: ['EVENT_CLOSING_SOON', 'EVENT_RESOLVED'],
        },
      },
    });
    stats.notifications = deletedNotifications.count;
    console.log(`  ✓ Eliminati ${stats.notifications} Notifiche relative agli eventi`);

    // 3. Elimina Transazioni correlate agli eventi
    // Le transazioni possono avere referenceId che punta a eventId o predictionId
    // Eliminiamo quelle di tipo PREDICTION_WIN e PREDICTION_LOSS che sono correlate agli eventi
    const deletedTransactions = await tx.transaction.deleteMany({
      where: {
        type: {
          in: ['PREDICTION_WIN', 'PREDICTION_LOSS'],
        },
      },
    });
    stats.transactions = deletedTransactions.count;
    console.log(`  ✓ Eliminati ${stats.transactions} Transazioni correlate agli eventi`);

    // 4. Conta record che verranno eliminati per cascata
    const [commentsCount, predictionsCount, eventFollowersCount] = await Promise.all([
      tx.comment.count(),
      tx.prediction.count(),
      tx.eventFollower.count(),
    ]);
    stats.comments = commentsCount;
    stats.predictions = predictionsCount;
    stats.eventFollowers = eventFollowersCount;

    // 5. Elimina Eventi (cascata elimina: Comment, Prediction, EventFollower)
    const deletedEvents = await tx.event.deleteMany({});
    stats.events = deletedEvents.count;
    console.log(`  ✓ Eliminati ${stats.events} Eventi`);
    console.log(`    → Cascata eliminati ${stats.comments} Commenti`);
    console.log(`    → Cascata eliminati ${stats.predictions} Previsioni`);
    console.log(`    → Cascata eliminati ${stats.eventFollowers} EventFollower`);
  });

  return stats;
}

/**
 * Funzione principale
 */
async function main() {
  const args = process.argv.slice(2);
  // Se --dry-run è esplicitamente specificato, usa dry-run
  // Altrimenti, se --force è presente, esegui effettivamente
  // Altrimenti, default a dry-run
  const isDryRun = args.includes('--dry-run') || !args.includes('--force');
  const isForce = args.includes('--force') && !args.includes('--dry-run');

  console.log('='.repeat(60));
  console.log('🧹 PURGE SCRIPT - Eliminazione Dati Correlati');
  console.log('='.repeat(60));
  console.log();

  if (isDryRun) {
    console.log('📋 MODALITÀ DRY-RUN (nessun dato verrà eliminato)\n');
  } else {
    console.log('⚠️  MODALITÀ ELIMINAZIONE EFFETTIVA\n');
  }

  try {
    // Conta i record che verranno eliminati
    console.log('📊 Conteggio record da eliminare...\n');
    const counts = await countRecordsToDelete(prisma);

    console.log('Record che verranno eliminati:');
    console.log(`  • Eventi: ${counts.events}`);
    console.log(`  • Commenti (cascata): ${counts.comments}`);
    console.log(`  • Previsioni (cascata): ${counts.predictions}`);
    console.log(`  • EventFollower (cascata): ${counts.eventFollowers}`);
    console.log(`  • Transazioni: ${counts.transactions}`);
    console.log(`  • Notifiche: ${counts.notifications}`);
    console.log(`  • AuditLog: ${counts.auditLogs}`);
    console.log();

    const totalRecords =
      counts.events +
      counts.comments +
      counts.predictions +
      counts.eventFollowers +
      counts.transactions +
      counts.notifications +
      counts.auditLogs;

    if (totalRecords === 0) {
      console.log('✅ Nessun record da eliminare. Database già pulito.');
      return;
    }

    if (isDryRun) {
      console.log('💡 Per eseguire l\'eliminazione effettiva, usa: npm run purge -- --force');
      return;
    }

    // Se siamo qui, --force è stato specificato, quindi procediamo
    console.log('⚠️  ATTENZIONE: Procedendo con l\'eliminazione effettiva di tutti i dati correlati agli eventi!');
    console.log();

    // Esegui l'eliminazione
    console.log('🗑️  Esecuzione eliminazione...\n');
    const stats = await purgeAllData(prisma);

    console.log();
    console.log('='.repeat(60));
    console.log('✅ ELIMINAZIONE COMPLETATA');
    console.log('='.repeat(60));
    console.log();
    console.log('Riepilogo eliminazioni:');
    console.log(`  • Eventi: ${stats.events}`);
    console.log(`  • Commenti: ${stats.comments}`);
    console.log(`  • Previsioni: ${stats.predictions}`);
    console.log(`  • EventFollower: ${stats.eventFollowers}`);
    console.log(`  • Transazioni: ${stats.transactions}`);
    console.log(`  • Notifiche: ${stats.notifications}`);
    console.log(`  • AuditLog: ${stats.auditLogs}`);
    console.log();
  } catch (error) {
    console.error('❌ Errore durante l\'eliminazione:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui lo script solo se eseguito direttamente (non quando importato nei test)
// tsx passa il file come primo argomento quando eseguito direttamente
const isDirectExecution = process.argv[1]?.includes('purge-all.ts') && !process.env.VITEST;

if (isDirectExecution) {
  main().catch((error) => {
    console.error('Errore fatale:', error);
    process.exit(1);
  });
}
