#!/usr/bin/env tsx
/**
 * Reseed the comment sections with premium, social-media-style English comments.
 *
 * What it does:
 *   1. Refreshes the bot users' identities to English social handles + avatars
 *      (skip with --keep-identities).
 *   2. DELETES every existing comment (and their reactions) on the platform.
 *   3. For each LIVE market (resolved = false, still open for betting), seeds
 *      20–25 comments that read like a TikTok/Instagram comment section:
 *      a mix of hype / skeptic / funny / question top-level comments and short
 *      threaded replies, by many different handles, with recency-weighted
 *      timestamps and 👍🔥❤️ reactions ("likes").
 *
 * Usage:
 *   npx tsx scripts/reseed-social-comments.ts                  # dry-run (no writes)
 *   npx tsx scripts/reseed-social-comments.ts --force          # execute
 *   npx tsx scripts/reseed-social-comments.ts --force --all    # include non-live markets too
 *   npx tsx scripts/reseed-social-comments.ts --force --keep-identities
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { socialIdentityForIndex } from "../lib/simulated-activity/social-identities";
import {
  bucketForCategory,
  pickRootLine,
  pickReplyLine,
} from "../lib/simulated-activity/social-comments";

const prisma = new PrismaClient();

const MIN_COMMENTS = 20;
const MAX_COMMENTS = 25;
const REPLY_RATIO = 0.35; // share of comments that are replies (after the first few)
const WINDOW_HOURS = 72; // spread comment timestamps over the last N hours
const EVENT_CONCURRENCY = 6; // events processed in parallel

const REACTION_TYPES = ["THUMBS_UP", "FIRE", "HEART"] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

const HOUR_MS = 60 * 60 * 1000;
const MIN_MS = 60 * 1000;

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Weighted reaction type: thumbs most common, then fire, then heart. */
function pickReactionType(): ReactionType {
  const r = Math.random();
  if (r < 0.6) return "THUMBS_UP";
  if (r < 0.88) return "FIRE";
  return "HEART";
}

/** "Likes" for a comment: usually small, occasionally a viral spike. */
function reactionCountFor(isReply: boolean): number {
  if (isReply) return Math.random() < 0.55 ? randInt(0, 4) : 0;
  const r = Math.random();
  if (r < 0.12) return randInt(14, 24); // hero comment
  if (r < 0.45) return randInt(4, 12);
  if (r < 0.8) return randInt(1, 4);
  return 0;
}

interface BotRef {
  id: string;
  index: number; // 0-based identity index (from bot-N email)
}

/** All bot users, ordered by their email index so identities map stably. */
async function loadBots(): Promise<BotRef[]> {
  const bots = await prisma.user.findMany({
    where: { role: "BOT" },
    select: { id: true, email: true },
  });
  return bots
    .map((b) => {
      const m = b.email?.match(/bot-(\d+)@/);
      const index = m ? parseInt(m[1], 10) - 1 : 0;
      return { id: b.id, index };
    })
    .sort((a, b) => a.index - b.index);
}

async function refreshBotIdentities(bots: BotRef[]): Promise<number> {
  let updated = 0;
  for (const bot of bots) {
    const identity = socialIdentityForIndex(bot.index);
    await prisma.user.update({
      where: { id: bot.id },
      data: { name: identity.name, image: identity.image },
    });
    updated++;
  }
  return updated;
}

interface SeedComment {
  authorId: string;
  content: string;
  createdAt: Date;
  isReply: boolean;
  parentSlot: number | null; // index into the per-event comment list
}

/** Builds the comment plan (no DB writes) for a single event. */
function planThread(
  bots: BotRef[],
  category: string | null,
  eventCreatedAt: Date,
  now: Date
): SeedComment[] {
  const n = randInt(MIN_COMMENTS, MAX_COMMENTS);
  const bucket = bucketForCategory(category);

  // Recency-weighted timestamps over the window, oldest -> newest.
  const start = Math.max(now.getTime() - WINDOW_HOURS * HOUR_MS, eventCreatedAt.getTime());
  const span = Math.max(now.getTime() - start, 30 * MIN_MS);
  const times = Array.from({ length: n }, () => {
    const u = Math.random();
    return start + span * Math.pow(u, 0.7); // skew toward "now"
  }).sort((a, b) => a - b);
  // Make the newest comment feel fresh ("a few minutes ago").
  times[n - 1] = now.getTime() - randInt(1, 25) * MIN_MS;

  // Distinct author per comment within a market (shuffled, no repeats up to 80).
  const authors = shuffle(bots);

  const comments: SeedComment[] = [];
  const rootSlots: number[] = [];

  for (let i = 0; i < n; i++) {
    const canReply = rootSlots.length > 0 && i >= 3;
    const isReply = canReply && Math.random() < REPLY_RATIO;

    let parentSlot: number | null = null;
    if (isReply) {
      // Bias replies toward the most recent roots so threads cluster.
      const pool = rootSlots.slice(-6);
      parentSlot = pool[Math.floor(Math.random() * pool.length)];
    } else {
      rootSlots.push(i);
    }

    comments.push({
      authorId: authors[i % authors.length].id,
      content: isReply ? pickReplyLine() : pickRootLine(bucket),
      createdAt: new Date(times[i]),
      isReply,
      parentSlot,
    });
  }

  return comments;
}

interface EventLite {
  id: string;
  category: string | null;
  createdAt: Date;
  title: string | null;
}

async function seedEvent(
  bots: BotRef[],
  event: EventLite,
  now: Date
): Promise<{ comments: number; reactions: number }> {
  const plan = planThread(bots, event.category, event.createdAt, now);

  // Create comments in chronological order so replies can reference parents.
  const createdIds: string[] = [];
  for (const c of plan) {
    const parentId = c.parentSlot !== null ? createdIds[c.parentSlot] : null;
    const created = await prisma.comment.create({
      data: {
        userId: c.authorId,
        eventId: event.id,
        content: c.content,
        parentId,
        createdAt: c.createdAt,
      },
      select: { id: true },
    });
    createdIds.push(created.id);
  }

  // Reactions ("likes") in one bulk insert per event.
  const reactionRows: { commentId: string; userId: string; type: string; createdAt: Date }[] = [];
  for (let i = 0; i < plan.length; i++) {
    const c = plan[i];
    const count = reactionCountFor(c.isReply);
    if (count === 0) continue;
    const reactors = shuffle(bots.filter((b) => b.id !== c.authorId)).slice(0, count);
    for (const r of reactors) {
      const after = now.getTime() - c.createdAt.getTime();
      reactionRows.push({
        commentId: createdIds[i],
        userId: r.id,
        type: pickReactionType(),
        createdAt: new Date(c.createdAt.getTime() + Math.floor(Math.random() * Math.max(after, MIN_MS))),
      });
    }
  }
  if (reactionRows.length > 0) {
    await prisma.reaction.createMany({ data: reactionRows, skipDuplicates: true });
  }

  return { comments: plan.length, reactions: reactionRows.length };
}

/** Simple bounded-concurrency map. */
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function main() {
  const force = process.argv.includes("--force");
  const includeAll = process.argv.includes("--all");
  const keepIdentities = process.argv.includes("--keep-identities");

  const now = new Date();
  const where = includeAll ? {} : { resolved: false, closesAt: { gt: now } };

  const [events, existingComments, existingReactions, bots] = await Promise.all([
    prisma.event.findMany({
      where,
      select: { id: true, category: true, createdAt: true, title: true },
    }),
    prisma.comment.count(),
    prisma.reaction.count(),
    loadBots(),
  ]);

  const estPerMarket = (MIN_COMMENTS + MAX_COMMENTS) / 2;
  console.log("=".repeat(64));
  console.log("Reseed social comments");
  console.log("=".repeat(64));
  console.log(`  Target markets:            ${events.length} (${includeAll ? "ALL events" : "live only"})`);
  console.log(`  Bots available:            ${bots.length}`);
  console.log(`  Comments per market:       ${MIN_COMMENTS}–${MAX_COMMENTS}`);
  console.log(`  Existing comments to wipe: ${existingComments}`);
  console.log(`  Existing reactions to wipe:${existingReactions}`);
  console.log(`  Refresh bot identities:    ${keepIdentities ? "no (--keep-identities)" : "yes"}`);
  console.log(`  Est. new comments:         ~${Math.round(events.length * estPerMarket)}`);
  console.log();

  if (events.length === 0) {
    console.log("No matching markets. Nothing to do.");
    await prisma.$disconnect();
    return;
  }
  if (bots.length === 0) {
    console.log("No bot users found. Run the simulated-activity bootstrap first.");
    await prisma.$disconnect();
    return;
  }

  if (!force) {
    console.log("Dry-run. Re-run with --force to apply.");
    console.log("Sample of markets that will be seeded:");
    for (const e of events.slice(0, 8)) console.log(`  • [${e.category}] ${e.title}`);
    await prisma.$disconnect();
    return;
  }

  if (!keepIdentities) {
    const updated = await refreshBotIdentities(bots);
    console.log(`  ✓ Bot identities refreshed: ${updated}`);
  }

  // Wipe existing comments (+ reactions).
  const delReactions = await prisma.reaction.deleteMany({});
  const delReplies = await prisma.comment.deleteMany({ where: { parentId: { not: null } } });
  const delRoots = await prisma.comment.deleteMany({});
  console.log(`  ✓ Deleted reactions: ${delReactions.count}`);
  console.log(`  ✓ Deleted comments:  ${delReplies.count + delRoots.count}`);
  console.log();

  console.log(`Seeding ${events.length} markets…`);
  let totalComments = 0;
  let totalReactions = 0;
  let done = 0;
  await mapPool(events, EVENT_CONCURRENCY, async (event) => {
    const res = await seedEvent(bots, event, now);
    totalComments += res.comments;
    totalReactions += res.reactions;
    done++;
    if (done % 10 === 0 || done === events.length) {
      console.log(`  …${done}/${events.length} markets`);
    }
    return res;
  });

  console.log();
  console.log("Done.");
  console.log(`  New comments:  ${totalComments}`);
  console.log(`  New reactions: ${totalReactions}`);
  console.log(`  Avg/market:    ${(totalComments / events.length).toFixed(1)} comments`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
