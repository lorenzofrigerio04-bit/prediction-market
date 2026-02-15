/**
 * Script di test Fase 3 + Fase 4: genera eventi da candidati verificati (Fase 1+2).
 * Esegui: npm run generate-events
 * Oppure: npx tsx scripts/generate-events-example.ts [maxEvents]
 *
 * Flusso: fetch trending (Fase 1) -> verify (Fase 2) -> generate (Fase 3) -> closesAt (Fase 4).
 * Fase 4: closesAt è calcolato con computeClosesAt (data esplicita vs default per categoria).
 * Richiede OPENAI_API_KEY (o ANTHROPIC_API_KEY se GENERATION_PROVIDER=anthropic).
 * Per test rapidi senza API notizie: usa candidati di esempio come in verify-candidates.
 */

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import type { NewsCandidate } from "../lib/event-sources/types";
import { fetchTrendingCandidates } from "../lib/event-sources";
import { verifyCandidates, getVerificationConfigFromEnv } from "../lib/event-verification";
import { generateEventsFromCandidates } from "../lib/event-generation";

const SAMPLE_CANDIDATES: NewsCandidate[] = [
  {
    title: "Il Parlamento europeo approva la direttiva sul salario minimo",
    snippet: "Maggioranza ampia. La direttiva entrerà in vigore entro il 2025.",
    url: "https://www.ansa.it/europa/2024/03/14/parlamento-ue-salario-minimo",
    sourceName: "ANSA",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Roma batte Lazio 2-1 nel derby",
    snippet: "Gol di Pellegrini e Dybala. La Lazio si riduce con Immobile.",
    url: "https://www.corriere.it/sport/calcio/derby-roma-lazio",
    sourceName: "Corriere della Sera",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Referendum costituzionale: il 22 ottobre si vota sul taglio dei parlamentari",
    snippet: "Data ufficiale confermata dal Presidente della Repubblica. Quorum richiesto.",
    url: "https://www.governo.it/referendum-22-ottobre",
    sourceName: "Governo italiano",
    publishedAt: new Date().toISOString(),
  },
  // Esempio "senza data" (trend): closesAt = default categoria (es. Intrattenimento 7 giorni)
  {
    title: "Il film Dune 3 supererà i 100 milioni di incasso al botteghino italiano?",
    snippet: "Previsioni degli analisti dopo il lancio del trailer.",
    url: "https://example.com/dune3-box-office",
    sourceName: "Cinema News",
    publishedAt: new Date().toISOString(),
  },
];

async function main() {
  const maxEvents = Math.min(10, Math.max(1, parseInt(process.argv[2] ?? "3", 10) || 3));

  console.log("=== Fase 3: Generazione eventi con LLM ===\n");

  let candidates: NewsCandidate[];
  const useLive = process.env.USE_LIVE_NEWS === "1";
  if (useLive) {
    console.log("📡 Fetch trending (Fase 1)...");
    candidates = await fetchTrendingCandidates(20);
    console.log(`   Trovati ${candidates.length} candidati.\n`);
  } else {
    console.log("📋 Uso candidati di esempio (imposta USE_LIVE_NEWS=1 per Fase 1 live).\n");
    candidates = SAMPLE_CANDIDATES;
  }

  const config = getVerificationConfigFromEnv();
  const verified = verifyCandidates(candidates, config);
  console.log(`✅ Candidati verificati (Fase 2): ${verified.length}\n`);

  if (verified.length === 0) {
    console.log("Nessun candidato verificato. Esci.");
    process.exit(0);
  }

  console.log(`🤖 Generazione eventi (max ${maxEvents}, max 3 per categoria)...\n`);
  const events = await generateEventsFromCandidates(verified, {
    maxPerCategory: 3,
    maxTotal: maxEvents,
    maxRetries: 2,
  });

  console.log(`--- Eventi generati (${events.length}) ---\n`);
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    console.log(`${i + 1}. [${e.category}] ${e.title}`);
    console.log(`   Descrizione: ${(e.description ?? "(nessuna)").slice(0, 80)}${(e.description?.length ?? 0) > 80 ? "…" : ""}`);
    console.log(`   Chiude: ${e.closesAt}`);
    console.log(`   Fonte: ${e.resolutionSourceUrl}`);
    console.log(`   Note: ${e.resolutionNotes.slice(0, 100)}${e.resolutionNotes.length > 100 ? "…" : ""}`);
    console.log("");
  }

  console.log("✅ Fine generazione.");
}

main().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
