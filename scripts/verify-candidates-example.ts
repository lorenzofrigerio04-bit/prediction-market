/**
 * Script di test Fase 2: verifica candidati su 5–10 notizie reali (o simulate).
 * Esegui: npx tsx scripts/verify-candidates-example.ts
 *
 * Valida i filtri: domini, vaghezza titolo, score di verificabilità.
 */

import type { NewsCandidate } from "../lib/event-sources/types";
import { verifyCandidates, evaluateResolvabilityCriteria, getVerificationConfigFromEnv } from "../lib/event-verification";

/** Esempi di notizie reali/simili per validare i filtri (titoli ispirati a notizie reali). */
const SAMPLE_CANDIDATES: NewsCandidate[] = [
  {
    title: "Il Parlamento europeo approva la direttiva sul salario minimo",
    snippet: "Maggioranza ampia. La direttiva entrerà in vigore entro il 2025.",
    url: "https://www.ansa.it/europa/2024/03/14/parlamento-ue-salario-minimo",
    sourceName: "ANSA",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Potrebbe piovere domani, ma non è sicuro",
    snippet: "Le previsioni sono incerte. Forse schiarite nel pomeriggio.",
    url: "https://example.com/meteo",
    sourceName: "Meteo Example",
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
    title: "Si dice che il governo stia per cadere",
    snippet: "Rumors in Parlamento. Ipotesi di crisi.",
    url: "https://gossip.it/rumors-governo",
    sourceName: "Gossip News",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Referendum costituzionale: il 22 ottobre si vota sul taglio dei parlamentari",
    snippet: "Data ufficiale confermata dal Presidente della Repubblica. Quorum richiesto.",
    url: "https://www.governo.it/referendum-22-ottobre",
    sourceName: "Governo italiano",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Chi vincerà le elezioni? Sondaggi contrastanti",
    snippet: "I sondaggi danno risultati diversi. Incerto il risultato.",
    url: "https://www.repubblica.it/politica/sondaggi-elezioni",
    sourceName: "La Repubblica",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Tribunale di Milano: condanna in primo grado per X in processo Y",
    snippet: "Sentenza depositata oggi. Ricorso possibile entro 90 giorni.",
    url: "https://www.giustizia.it/tribunale-milano-sentenza",
    sourceName: "Ministero della Giustizia",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Breve",
    snippet: "Troppo corto.",
    url: "https://www.ansa.it/breve",
    sourceName: "ANSA",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "La Banca d’Italia alza i tassi di 0,25 punti dal 1° marzo",
    snippet: "Comunicato ufficiale. Decisione della riunione di oggi.",
    url: "https://www.bancaditalia.it/comunicati/tassi-marzo",
    sourceName: "Banca d'Italia",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Incredibile shock: da non credere cosa è successo",
    snippet: "Breaking news. Ultim'ora. Leggi qui.",
    url: "https://clickbait.example.com/shock",
    sourceName: "Clickbait",
    publishedAt: new Date().toISOString(),
  },
];

function main() {
  console.log("=== Fase 2: Verifica qualità e risolvibilità ===\n");

  const config = getVerificationConfigFromEnv();
  console.log("Config (domini):");
  console.log("  domainWhitelist:", config.domainWhitelist.length ? config.domainWhitelist : "(tutti ammessi)");
  console.log("  domainBlacklist:", config.domainBlacklist);
  console.log("  minTitleLength:", config.minTitleLength, "| maxTitleLength:", config.maxTitleLength);
  console.log("  filterByScore:", config.filterByScore, "| minVerificationScore:", config.minVerificationScore);
  console.log();

  console.log("Candidati in input:", SAMPLE_CANDIDATES.length);
  const verified = verifyCandidates(SAMPLE_CANDIDATES, config);
  console.log("Candidati verificati (dopo filtri):", verified.length);
  console.log();

  console.log("--- Dettaglio candidati verificati (ordinati per score) ---\n");
  for (let i = 0; i < verified.length; i++) {
    const v = verified[i];
    const criteria = evaluateResolvabilityCriteria(
      v.title,
      v.snippet ?? "",
      v.url,
      v.sourceName ?? "",
      config
    );
    console.log(`${i + 1}. [${v.verificationScore.toFixed(2)}] ${v.title.slice(0, 60)}${v.title.length > 60 ? "…" : ""}`);
    console.log(`   URL: ${v.url}`);
    console.log(`   Criteri: binario=${criteria.binaryOutcome} fonte=${criteria.hasOfficialSource} scadenza=${criteria.plausibleDeadline}`);
    console.log();
  }

  console.log("--- Candidati scartati (con motivo euristico) ---\n");
  for (const c of SAMPLE_CANDIDATES) {
    if (verified.some((v) => v.url === c.url)) continue;
    const criteria = evaluateResolvabilityCriteria(
      c.title,
      c.snippet ?? "",
      c.url,
      c.sourceName ?? "",
      config
    );
    let reason = "score basso";
    if (!criteria.domainAllowed) reason = "dominio non ammesso";
    else if (!criteria.notTooVague) reason = "titolo troppo vago";
    console.log(`- ${c.title.slice(0, 50)}… → ${reason}`);
  }

  console.log("\n✅ Fine validazione filtri.");
}

main();
