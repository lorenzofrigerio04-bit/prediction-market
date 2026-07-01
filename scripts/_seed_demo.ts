/**
 * One-off seeding: rende "vivi" tutti i mercati aperti con attività organica
 * (% variegate via trade AMM reali, commenti contestuali, reazioni, follow).
 * Nessun marcatore "simulato" visibile: i bot sono utenti normali (nome italiano),
 * i commenti sono Comment normali, le % derivano da trade reali.
 *
 * Uso: npx tsx scripts/_seed_demo.ts   (richiede DATABASE_URL, OPENAI_API_KEY in .env)
 * Reversibile: scripts/remove-bot-activity.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import type { CommentTone } from "../lib/simulated-activity/contextual-comment";

// Abilita attività + commenti LLM solo per questa run (i moduli leggono questi flag).
process.env.DISABLE_SIMULATED_ACTIVITY = "false";
process.env.ENABLE_SIMULATED_ACTIVITY = "true";
process.env.ENABLE_LLM_COMMENTS = process.env.ENABLE_LLM_COMMENTS ?? "true";
process.env.DISABLE_OPENAI = process.env.DISABLE_OPENAI ?? "false";

const prisma = new PrismaClient({ log: ["error"] });

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL mancante");
    process.exit(1);
  }

  const { getOrCreateBotUsers, ensureBotsHaveCredits } = await import("../lib/simulated-activity/bot-users");
  const { createSimulatedPrediction } = await import("../lib/simulated-activity/predictions");
  const { createSimulatedComment } = await import("../lib/simulated-activity/comments");
  const { generateContextualComment } = await import("../lib/simulated-activity/contextual-comment");
  const { COMMENT_TEMPLATES } = await import("../lib/simulated-activity/comment-templates");
  const { runSimulatedReactions } = await import("../lib/simulated-activity/reactions");
  const { runSimulatedFollows } = await import("../lib/simulated-activity/followers");
  const { priceYesMicros, SCALE } = await import("../lib/amm/fixedPointLmsr");
  const { executeBuySharesMultiOutcome } = await import("../lib/amm/multi-outcome-engine");
  const { parseOutcomesJson } = await import("../lib/market-types");

  console.log("Creazione/recupero bot…");
  const bots = await getOrCreateBotUsers(prisma, 80);
  await ensureBotsHaveCredits(prisma);
  const botIds = bots.map((b) => b.id);

  const now = new Date();
  let markets = await prisma.event.findMany({
    where: { resolved: false, hidden: false, closesAt: { gt: now }, tradingMode: "AMM" },
    select: { id: true, title: true, category: true, marketType: true, outcomes: true },
    orderBy: { totalCredits: "desc" },
  });
  const limit = process.env.SEED_LIMIT ? parseInt(process.env.SEED_LIMIT, 10) : 0;
  if (limit > 0) markets = markets.slice(0, limit);
  console.log(`Mercati da popolare: ${markets.length}`);

  let movedBin = 0, movedMulti = 0, trades = 0, comments = 0, idx = 0;

  for (const m of markets) {
    idx++;
    const isMulti = !!m.marketType && m.marketType !== "BINARY";
    try {
      if (!isMulti) {
        // Target % variegato e distinto per mercato (con qualche estremo).
        let target = 0.5 + (Math.random() * 2 - 1) * 0.4;
        if (Math.random() < 0.18) target = Math.random() < 0.5 ? ri(6, 16) / 100 : ri(84, 95) / 100;
        target = clamp(target, 0.06, 0.95);

        for (let it = 0; it < 14; it++) {
          const amm = await prisma.ammState.findUnique({
            where: { eventId: m.id },
            select: { qYesMicros: true, qNoMicros: true, bMicros: true },
          });
          if (!amm) break;
          const pYes = Number((priceYesMicros(amm.qYesMicros, amm.qNoMicros, amm.bMicros) * 100n) / SCALE) / 100;
          const remaining = Math.abs(pYes - target);
          if (remaining < 0.035) break;
          const outcome: "YES" | "NO" = pYes < target ? "YES" : "NO";
          const credits = clamp(Math.round(remaining * 1600), 120, 1200);
          const r = await createSimulatedPrediction(prisma, { userId: pick(botIds), eventId: m.id, outcome, credits });
          if (r.success) trades++; else break;
        }
        // Volume a due lati (rumore) per realismo.
        for (let k = 0; k < ri(1, 3); k++) {
          const r = await createSimulatedPrediction(prisma, {
            userId: pick(botIds), eventId: m.id, outcome: Math.random() < 0.5 ? "YES" : "NO", credits: ri(40, 220),
          });
          if (r.success) trades++;
        }
        movedBin++;
      } else {
        const outs = parseOutcomesJson(m.outcomes) ?? [];
        if (outs.length > 0) {
          // Pochi outcome "leader" + coda, per una distribuzione % realistica.
          const leaders = outs.slice().sort(() => Math.random() - 0.5).slice(0, Math.min(3, outs.length));
          for (let k = 0; k < ri(8, 16); k++) {
            const o = Math.random() < 0.7 ? pick(leaders) : pick(outs);
            try {
              await prisma.$transaction((tx) =>
                executeBuySharesMultiOutcome(tx, {
                  eventId: m.id, userId: pick(botIds), outcome: o.key,
                  maxCostMicros: BigInt(ri(80, 450)) * SCALE, idempotencyKey: `seed-${randomUUID()}`,
                })
              );
              trades++;
            } catch { /* skip */ }
          }
          movedMulti++;
        }
      }

      // Commenti contestuali (LLM con fallback template), con qualche risposta.
      let lastTop: string | undefined;
      for (let c = 0; c < ri(2, 4); c++) {
        const tone: CommentTone = Math.random() < 0.5 ? "serious" : "light";
        let content = await generateContextualComment(m.title ?? "", m.category ?? "", tone);
        if (!content) {
          const elig = COMMENT_TEMPLATES.filter((t) => !t.category || t.category === m.category);
          content = (elig.length ? pick(elig) : pick(COMMENT_TEMPLATES)).text;
        }
        const asReply = !!lastTop && Math.random() < 0.35;
        const r = await createSimulatedComment(prisma, {
          userId: pick(botIds), eventId: m.id, content, parentId: asReply ? lastTop : undefined, isBot: true,
        });
        if (r.success) { comments++; if (!asReply) lastTop = r.commentId; }
      }
    } catch (e) {
      console.log(`  ! errore su ${m.id}: ${(e as Error).message}`);
    }
    if (idx % 5 === 0 || idx === markets.length) {
      console.log(`[${idx}/${markets.length}] trade=${trades} commenti=${comments}`);
    }
  }

  console.log("Reazioni…");
  const reactions = await runSimulatedReactions(prisma, botIds, { maxReactions: 500 });
  console.log("Follow…");
  const follows = await runSimulatedFollows(prisma, botIds, { maxFollows: 220 });

  console.log("\n=== FATTO ===");
  console.log(JSON.stringify({
    mercati: markets.length, binariMossi: movedBin, multiMossi: movedMulti,
    trade: trades, commenti: comments, reazioni: reactions.created, follow: follows.created,
  }, null, 2));
}

main()
  .catch((e) => { console.error("Errore fatale:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
