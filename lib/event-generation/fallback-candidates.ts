/**
 * Candidati di esempio con date esito nel futuro.
 * Usati quando il fetch notizie fallisce (timeout, SSL, ecc.) in script e in admin run-generate-events.
 */

import type { NewsCandidate } from "@/lib/event-sources/types";
import type { VerificationConfig } from "@/lib/event-verification/types";
import { getVerificationConfigFromEnv } from "@/lib/event-verification";

export const FALLBACK_CANDIDATES: NewsCandidate[] = [
  {
    title: "Il Parlamento europeo approverà la direttiva sul salario minimo entro il 2026?",
    snippet: "Maggioranza ampia. La direttiva entrerà in vigore entro il 2026.",
    url: "https://www.ansa.it/europa/parlamento-ue-salario-minimo",
    sourceName: "ANSA",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Il prezzo del Bitcoin supererà i 100.000$ entro fine 2026?",
    snippet:
      "Previsioni analisti. Riuscirà il Bitcoin a superare i 100.000 dollari entro la fine del 2026?",
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

/** Config verifica per far passare i candidati di esempio (no whitelist, no filter by score, no "?" come vago). */
export function getFallbackVerificationConfig(): VerificationConfig {
  const base = getVerificationConfigFromEnv();
  return {
    ...base,
    domainWhitelist: [],
    filterByScore: false,
    vagueKeywords: base.vagueKeywords.filter((kw) => kw !== "?"),
  };
}
