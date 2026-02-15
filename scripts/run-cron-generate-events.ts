/**
 * Esegue una run manuale della pipeline di generazione eventi (fetch → verify → generate → create in DB).
 * Utile per vedere subito nuovi eventi con criteri corretti senza aspettare il cron.
 *
 * Se il fetch delle notizie fallisce (timeout, SSL, ecc.) usa candidati di esempio con date future.
 * Richiede: OPENAI_API_KEY o ANTHROPIC_API_KEY (vedi GENERATION_PROVIDER). NEWS_API_KEY solo per fetch reale.
 * Esegui: npx tsx scripts/run-cron-generate-events.ts [maxTotal]
 * Default maxTotal: 5
 */

import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import type { NewsCandidate } from "../lib/event-sources/types";
import { fetchTrendingCandidates } from "../lib/event-sources";
import { getVerificationConfigFromEnv } from "../lib/event-verification";
import { PrismaClient } from "@prisma/client";
import { runPipeline } from "../lib/event-generation";

/** Candidati di esempio con date esito nel futuro (usati se il fetch fallisce). */
const FALLBACK_CANDIDATES: NewsCandidate[] = [
  {
    title: "Il Parlamento europeo approverà la direttiva sul salario minimo entro il 2026?",
    snippet: "Maggioranza ampia. La direttiva entrerà in vigore entro il 2026.",
    url: "https://www.ansa.it/europa/parlamento-ue-salario-minimo",
    sourceName: "ANSA",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Il prezzo del Bitcoin supererà i 100.000$ entro fine 2026?",
    snippet: "Previsioni analisti. Riuscirà il Bitcoin a superare i 100.000 dollari entro la fine del 2026?",
    url: "https://www.reuters.com/markets/currencies/bitcoin",
    sourceName: "Reuters",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Ci sarà un nuovo governo italiano entro 6 mesi?",
    snippet: "Previsione sulla stabilità del governo. Cambio di governo o nuove elezioni entro 6 mesi?",
    url: "https://www.corriere.it/politica",
    sourceName: "Corriere della Sera",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "La Juventus vincerà il prossimo campionato di Serie A?",
    snippet: "Previsione sul campionato italiano di calcio. Esito verificabile a fine maggio 2026.",
    url: "https://www.gazzetta.it/calcio/serie-a",
    sourceName: "Gazzetta dello Sport",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Il film Dune 3 supererà i 100 milioni di incasso al botteghino italiano?",
    snippet: "Previsioni degli analisti dopo il lancio del trailer. Esito a fine 2026.",
    url: "https://www.ansa.it/cultura/cinema",
    sourceName: "ANSA",
    publishedAt: new Date().toISOString(),
  },
];

async function main() {
  const maxTotal = Math.min(20, Math.max(1, parseInt(process.argv[2] ?? "5", 10) || 5));
  console.log("🔄 Run manuale pipeline generazione eventi (maxTotal =", maxTotal, ")\n");

  let candidates: NewsCandidate[];
  console.log("📡 Fetch notizie in corso...");
  try {
    candidates = await fetchTrendingCandidates(60);
  } catch (err) {
    console.warn("Fetch fallito:", (err instanceof Error ? err.message : String(err)).slice(0, 80));
    candidates = [];
  }
  const usingFallback = candidates.length === 0;
  if (usingFallback) {
    console.log("   Nessun candidato dal fetch; uso candidati di esempio (date future).\n");
    candidates = FALLBACK_CANDIDATES;
  } else {
    console.log("   Candidati dal fetch:", candidates.length, "\n");
  }

  const prisma = new PrismaClient({
    log: ["error", "warn"],
  });

  const verificationConfig = usingFallback
    ? (() => {
        const base = getVerificationConfigFromEnv();
        return {
          ...base,
          domainWhitelist: [],
          filterByScore: false,
          vagueKeywords: base.vagueKeywords.filter((kw) => kw !== "?"),
        };
      })()
    : undefined;

  try {
    const result = await runPipeline(prisma, {
      limit: 60,
      candidatesOverride: candidates,
      verificationConfig,
      generation: {
        maxPerCategory: 5,
        maxTotal,
        maxRetries: 2,
      },
    });

    console.log("\n--- Risultato ---");
    console.log("Candidati fetch:", result.candidatesCount);
    console.log("Dopo verifica:", result.verifiedCount);
    console.log("Generati (LLM):", result.generatedCount);
    console.log("Creati in DB:", result.createResult.created);
    console.log("Skipped (duplicati):", result.createResult.skipped);
    if (result.createResult.errors.length > 0) {
      console.log("Errori:", result.createResult.errors);
    }
    if (result.createResult.eventIds.length > 0) {
      console.log("ID eventi creati:", result.createResult.eventIds);
    }
    console.log("\n✅ Fine.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
