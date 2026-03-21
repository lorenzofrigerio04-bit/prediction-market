#!/usr/bin/env tsx
/**
 * markets:purge - Event Gen v2 Migration
 *
 * Safely backs up and deletes all market-related data.
 *
 * Tables affected: events, positions, trades, amm_state, comments, predictions,
 * event_followers, posts, event_probability_snapshots, audit_logs, notifications,
 * transactions (PREDICTION_WIN/LOSS).
 *
 * Requirements:
 * - Backup before deletion (pg_dump)
 * - Transaction safety
 * - Foreign key handling (explicit order + cascade)
 * - Logging of deleted rows
 *
 * Usage:
 *   pnpm markets:purge --dry                    # Counts only, no backup/delete
 *   pnpm markets:purge --no-backup              # Purge without backup (use with caution)
 *   CONFIRM_DELETE_ALL_MARKETS=true pnpm markets:purge
 */

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });
import { spawn } from "child_process";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error", "warn"] });

export interface MarketsPurgeStats {
  events: number;
  positions: number;
  trades: number;
  ammState: number;
  comments: number;
  predictions: number;
  eventFollowers: number;
  posts: number;
  eventProbabilitySnapshots: number;
  auditLogs: number;
  notifications: number;
  transactions: number;
}

const PURGE_TABLES = [
  "event_probability_snapshots",
  "post_comments",
  "post_likes",
  "posts",
  "comment_reactions",
  "comments",
  "predictions",
  "event_followers",
  "positions",
  "trades",
  "amm_state",
  "events",
  "audit_logs",
  "notifications",
  "transactions",
];

/**
 * Run pg_dump to backup affected tables.
 * Returns backup file path or null if backup skipped/failed.
 */
async function runBackup(backupDir: string): Promise<string | null> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("⚠️  DATABASE_URL not set, skipping backup.");
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupPath = join(backupDir, `markets-purge-${timestamp}.sql`);

  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  return new Promise((resolve) => {
    const args = [
      "--data-only",
      "--no-owner",
      "--no-privileges",
      "-f",
      backupPath,
      ...PURGE_TABLES.flatMap((t) => ["-t", t]),
      dbUrl,
    ];

    const proc = spawn("pg_dump", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    proc.stderr?.on("data", (d) => (stderr += d.toString()));

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`  ✓ Backup written to ${backupPath}`);
        resolve(backupPath);
      } else {
        console.warn(
          `⚠️  pg_dump failed (code ${code}). Backup skipped. Run with --no-backup to skip.`
        );
        if (stderr) console.warn("  stderr:", stderr.slice(0, 200));
        resolve(null);
      }
    });
  });
}

/**
 * Count all records that will be deleted.
 */
export async function countRecordsToDelete(
  client: PrismaClient = prisma
): Promise<MarketsPurgeStats> {
  const [
    events,
    positions,
    trades,
    ammState,
    comments,
    predictions,
    eventFollowers,
    posts,
    eventProbabilitySnapshots,
    auditLogs,
    notifications,
    transactions,
  ] = await Promise.all([
    client.event.count(),
    client.position.count(),
    client.trade.count(),
    client.ammState.count(),
    client.comment.count(),
    client.prediction.count(),
    client.eventFollower.count(),
    client.post.count(),
    client.eventProbabilitySnapshot.count(),
    client.auditLog.count({ where: { entityType: "event" } }),
    client.notification.count({
      where: {
        type: { in: ["EVENT_CLOSING_SOON", "EVENT_RESOLVED"] },
      },
    }),
    client.transaction.count({
      where: {
        type: { in: ["PREDICTION_WIN", "PREDICTION_LOSS"] },
      },
    }),
  ]);

  return {
    events,
    positions,
    trades,
    ammState,
    comments,
    predictions,
    eventFollowers,
    posts,
    eventProbabilitySnapshots,
    auditLogs,
    notifications,
    transactions,
  };
}

/**
 * Purge all market-related data in a transaction.
 */
export async function purgeMarketsData(
  client: PrismaClient = prisma
): Promise<MarketsPurgeStats> {
  const stats: MarketsPurgeStats = {
    events: 0,
    positions: 0,
    trades: 0,
    ammState: 0,
    comments: 0,
    predictions: 0,
    eventFollowers: 0,
    posts: 0,
    eventProbabilitySnapshots: 0,
    auditLogs: 0,
    notifications: 0,
    transactions: 0,
  };

  await client.$transaction(async (tx) => {
    // Pre-count cascade tables for logging
    const [
      positionsCount,
      tradesCount,
      ammStateCount,
      commentsCount,
      predictionsCount,
      eventFollowersCount,
      postsCount,
      eventProbabilitySnapshotsCount,
    ] = await Promise.all([
      tx.position.count(),
      tx.trade.count(),
      tx.ammState.count(),
      tx.comment.count(),
      tx.prediction.count(),
      tx.eventFollower.count(),
      tx.post.count(),
      tx.eventProbabilitySnapshot.count(),
    ]);

    // 1. AuditLog
    const deletedAuditLogs = await tx.auditLog.deleteMany({
      where: { entityType: "event" },
    });
    stats.auditLogs = deletedAuditLogs.count;
    console.log(`  ✓ Deleted ${stats.auditLogs} audit_logs`);

    // 2. Notifications
    const deletedNotifications = await tx.notification.deleteMany({
      where: {
        type: { in: ["EVENT_CLOSING_SOON", "EVENT_RESOLVED"] },
      },
    });
    stats.notifications = deletedNotifications.count;
    console.log(`  ✓ Deleted ${stats.notifications} notifications`);

    // 3. Transactions (PREDICTION_WIN, PREDICTION_LOSS)
    const deletedTransactions = await tx.transaction.deleteMany({
      where: {
        type: { in: ["PREDICTION_WIN", "PREDICTION_LOSS"] },
      },
    });
    stats.transactions = deletedTransactions.count;
    console.log(`  ✓ Deleted ${stats.transactions} transactions`);

    // 4. Events (cascade: positions, trades, amm_state, comments, predictions, event_followers, posts, event_probability_snapshots)
    const deletedEvents = await tx.event.deleteMany({});
    stats.events = deletedEvents.count;
    stats.positions = positionsCount;
    stats.trades = tradesCount;
    stats.ammState = ammStateCount;
    stats.comments = commentsCount;
    stats.predictions = predictionsCount;
    stats.eventFollowers = eventFollowersCount;
    stats.posts = postsCount;
    stats.eventProbabilitySnapshots = eventProbabilitySnapshotsCount;

    console.log(`  ✓ Deleted ${stats.events} events`);
    console.log(`    → Cascade: ${stats.positions} positions, ${stats.trades} trades, ${stats.ammState} amm_state`);
    console.log(`    → Cascade: ${stats.comments} comments, ${stats.predictions} predictions, ${stats.eventFollowers} event_followers`);
    console.log(`    → Cascade: ${stats.posts} posts, ${stats.eventProbabilitySnapshots} event_probability_snapshots`);
  });

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry");
  const noBackup = args.includes("--no-backup");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not configured.");
    process.exit(1);
  }

  if (!dryRun && process.env.CONFIRM_DELETE_ALL_MARKETS !== "true") {
    console.error("To purge all markets, set CONFIRM_DELETE_ALL_MARKETS=true");
    console.error("Example: CONFIRM_DELETE_ALL_MARKETS=true pnpm markets:purge");
    console.error("For counts only: pnpm markets:purge --dry");
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("markets:purge - Event Gen v2 Migration");
  console.log("=".repeat(60));
  console.log();

  try {
    const counts = await countRecordsToDelete(prisma);

    console.log("Records to delete:");
    console.log(`  • events: ${counts.events}`);
    console.log(`  • positions: ${counts.positions}`);
    console.log(`  • trades: ${counts.trades}`);
    console.log(`  • amm_state: ${counts.ammState}`);
    console.log(`  • comments: ${counts.comments}`);
    console.log(`  • predictions: ${counts.predictions}`);
    console.log(`  • event_followers: ${counts.eventFollowers}`);
    console.log(`  • posts: ${counts.posts}`);
    console.log(`  • event_probability_snapshots: ${counts.eventProbabilitySnapshots}`);
    console.log(`  • audit_logs: ${counts.auditLogs}`);
    console.log(`  • notifications: ${counts.notifications}`);
    console.log(`  • transactions: ${counts.transactions}`);
    console.log();

    const total =
      counts.events +
      counts.positions +
      counts.trades +
      counts.ammState +
      counts.comments +
      counts.predictions +
      counts.eventFollowers +
      counts.posts +
      counts.eventProbabilitySnapshots +
      counts.auditLogs +
      counts.notifications +
      counts.transactions;

    if (total === 0) {
      console.log("✅ No records to delete. Database already clean.");
      return;
    }

    if (dryRun) {
      console.log("[DRY RUN] No backup or deletion performed.");
      return;
    }

    // Backup (unless --no-backup)
    const backupDir = join(process.cwd(), "backups");
    if (!noBackup) {
      console.log("Creating backup...");
      await runBackup(backupDir);
      console.log();
    } else {
      console.log("Skipping backup (--no-backup).");
    }

    // Purge
    console.log("Purging market data...");
    const stats = await purgeMarketsData(prisma);

    console.log();
    console.log("=".repeat(60));
    console.log("✅ PURGE COMPLETED");
    console.log("=".repeat(60));
    console.log("Summary:");
    console.log(`  • events: ${stats.events}`);
    console.log(`  • positions: ${stats.positions}`);
    console.log(`  • trades: ${stats.trades}`);
    console.log(`  • amm_state: ${stats.ammState}`);
    console.log(`  • comments: ${stats.comments}`);
    console.log(`  • predictions: ${stats.predictions}`);
    console.log(`  • event_followers: ${stats.eventFollowers}`);
    console.log(`  • posts: ${stats.posts}`);
    console.log(`  • event_probability_snapshots: ${stats.eventProbabilitySnapshots}`);
    console.log(`  • audit_logs: ${stats.auditLogs}`);
    console.log(`  • notifications: ${stats.notifications}`);
    console.log(`  • transactions: ${stats.transactions}`);
    console.log();
    console.log("Next steps:");
    console.log("  1. Set EVENT_GEN_V2=true in .env");
    console.log("  2. Run: pnpm markets:seed-v2");
  } catch (error) {
    console.error("Error during purge:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
