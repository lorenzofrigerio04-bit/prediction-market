/**
 * Definizione canonica dei tipi di mercato supportati dalla piattaforma.
 * Usato da: schema DB, AI Market Type Selector, UI, risoluzione e payout.
 */

export const MARKET_TYPE_IDS = [
  "BINARY",
  "MULTIPLE_CHOICE",
  "SCALAR",
  "RANGE",
  "THRESHOLD",
  "LADDER",
  "TIME_TO_EVENT",
  "COUNT_VOLUME",
  "RANKING",
] as const;

export type MarketTypeId = (typeof MARKET_TYPE_IDS)[number];

export const MARKET_TYPE_LABELS: Record<MarketTypeId, string> = {
  BINARY: "Binario (Sì/No)",
  MULTIPLE_CHOICE: "Scelta multipla (categorico)",
  SCALAR: "Scalare (numerico continuo)",
  RANGE: "Intervalli (range)",
  THRESHOLD: "Soglia singola",
  LADDER: "Ladder (multi-soglia)",
  TIME_TO_EVENT: "Tempo all'evento",
  COUNT_VOLUME: "Conteggio / Volume",
  RANKING: "Classifica / Posizione",
};

export const MARKET_TYPE_DESCRIPTIONS: Record<MarketTypeId, string> = {
  BINARY:
    "Evento con due soli esiti (Sì/No). Ideale per breaking news, decisioni politiche, eventi chiari e verificabili.",
  MULTIPLE_CHOICE:
    "Più opzioni, una sola vincente. Ideale per sport, elezioni, premi.",
  SCALAR:
    "Risultato è un numero continuo. Ideale per prezzi, inflazione, dati macro.",
  RANGE:
    "Il valore cade in un intervallo predefinito. Alternativa più semplice allo scalare, adatta al retail.",
  THRESHOLD:
    "Sopra/sotto una soglia (sì/no). Versione semplice di mercati numerici.",
  LADDER:
    "Più soglie indipendenti (serie di mercati binari). Massimo engagement su prezzi, crypto, energia.",
  TIME_TO_EVENT:
    "Quando accadrà qualcosa. Ideale per eventi attesi ma incerti (politica, tech, conflitti).",
  COUNT_VOLUME:
    "Numero di eventi o volume entro una data. Ideale per metriche cumulative (sport, economia).",
  RANKING:
    "Posizione finale in classifica. Ideale per campionati, classifiche aziendali.",
};

/** Esempi brevi per prompt AI e UI */
export const MARKET_TYPE_EXAMPLES: Record<MarketTypeId, string> = {
  BINARY: "L'UE approverà nuove sanzioni contro l'Iran entro il 30 giugno 2026? YES / NO",
  MULTIPLE_CHOICE:
    "Chi vincerà la Champions League 2025-26? Real Madrid | Manchester City | Inter | Bayern | Altro",
  SCALAR: "Prezzo del petrolio Brent il 30 giugno 2026 ($)",
  RANGE:
    "Prezzo benzina in Italia a giugno 2026: < €1.90 | €1.90–2.10 | €2.10–2.40 | €2.40+",
  THRESHOLD: "Bitcoin supererà $100.000 nel 2026? YES / NO",
  LADDER:
    "BTC entro il 2026: $90k? $100k? $120k? $150k? (ogni soglia = mercato separato)",
  TIME_TO_EVENT:
    "Quando finirà il conflitto Iran-Israele? entro giugno 2026 | entro dicembre 2026 | 2027 | dopo il 2027",
  COUNT_VOLUME:
    "Quanti gol farà Lautaro in Serie A 2025-26? 0–15 | 16–20 | 21–25 | 25+",
  RANKING:
    "Posizione finale Ferrari nel mondiale F1 2026: 1° | 2° | 3° | 4°+",
};

/** Tipi che al resolution accettano un singolo outcome key (come YES/NO o chiave opzione). */
export const SINGLE_OUTCOME_MARKET_TYPES: MarketTypeId[] = [
  "BINARY",
  "MULTIPLE_CHOICE",
  "RANGE",
  "THRESHOLD",
  "TIME_TO_EVENT",
  "COUNT_VOLUME",
  "RANKING",
];

/** Tipi che richiedono un valore numerico alla risoluzione (es. prezzo). */
export const SCALAR_RESOLUTION_MARKET_TYPES: MarketTypeId[] = ["SCALAR"];

/** Ladder = N mercati binari/threshold separati; non è un singolo Event con N outcome. */
export const LADDER_AS_SEPARATE_EVENTS = true;

/** Tipi che si risolvono con YES/NO e hanno payout AMM (Position yes/no). */
export const BINARY_OUTCOME_MARKET_TYPES: MarketTypeId[] = ["BINARY", "THRESHOLD"];

/** Tipi che si risolvono con la chiave di un'opzione (outcomes[]); payout multi-opzione non ancora implementato. */
export const MULTI_OPTION_MARKET_TYPES: MarketTypeId[] = [
  "MULTIPLE_CHOICE",
  "RANGE",
  "TIME_TO_EVENT",
  "COUNT_VOLUME",
  "RANKING",
];

export function isMarketTypeId(s: string): s is MarketTypeId {
  return MARKET_TYPE_IDS.includes(s as MarketTypeId);
}

export function getMarketTypeLabel(id: MarketTypeId): string {
  return MARKET_TYPE_LABELS[id] ?? id;
}

export function getMarketTypeDescription(id: MarketTypeId): string {
  return MARKET_TYPE_DESCRIPTIONS[id] ?? "";
}

export function getMarketTypeExample(id: MarketTypeId): string {
  return MARKET_TYPE_EXAMPLES[id] ?? "";
}
