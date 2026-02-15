/**
 * Script di test Fase 1: stampa i candidati trending (notizie normalizzate).
 * Esegui dalla root: npx tsx scripts/fetch-trending.ts [limit]
 * Carica .env e .env.local (override) dalla root.
 */
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });
import { fetchTrendingCandidates } from "../lib/event-sources";

const limit = Math.min(
  100,
  Math.max(1, parseInt(process.argv[2] ?? "10", 10) || 10)
);

async function main() {
  console.log(`\n📡 Fetch trending candidates (limit=${limit})...\n`);

  const candidates = await fetchTrendingCandidates(limit);

  console.log(`✅ Trovati ${candidates.length} candidati:\n`);
  if (candidates.length === 0) {
    console.log("   Nessun risultato. Verifica NEWS_API_KEY in .env e filtri (lingua, date).");
    return;
  }

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    console.log(`${i + 1}. ${c.title}`);
    console.log(`   ${c.snippet.slice(0, 80)}${c.snippet.length > 80 ? "…" : ""}`);
    console.log(`   Fonte: ${c.sourceName} | ${c.publishedAt}`);
    console.log(`   ${c.url}`);
    console.log("");
  }
}

main().catch((e) => {
  console.error("Errore:", e);
  process.exit(1);
});
