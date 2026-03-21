/**
 * Prompt per generazione titolo + market type (una sola chiamata LLM).
 * Ogni titolo deve avere: soggetto + azione + scadenza + "?", strutturati nel modo migliore per la notizia.
 * Supporta i 9 tipi di mercato: BINARY, MULTIPLE_CHOICE, SCALAR, RANGE, THRESHOLD, LADDER, TIME_TO_EVENT, COUNT_VOLUME, RANKING.
 */

const MARKET_TYPES_DESC = `Tipi di mercato (market_type):
- BINARY: due soli esiti (Sì/No). Breaking news, decisioni politiche, eventi verificabili.
- MULTIPLE_CHOICE: più opzioni, una vincente. Sport, elezioni, premi (es. "Chi vincerà la Champions?").
- SCALAR: risultato numerico continuo. Prezzi, inflazione, dati macro (es. "Prezzo Brent il 30/06/2026 ($)").
- RANGE: valore in un intervallo predefinito. Più semplice dello scalare per utenti retail (es. "Prezzo benzina: <1.90 | 1.90-2.10 | 2.10+").
- THRESHOLD: sopra/sotto una soglia (Sì/No). Es. "Bitcoin supererà 100k nel 2026?".
- LADDER: più soglie indipendenti (ogni soglia = mercato separato). Crypto, prezzi, energia (es. "BTC: 90k? 100k? 120k?").
- TIME_TO_EVENT: quando accadrà qualcosa. Politica, tech, conflitti (es. "Quando finirà il conflitto X? entro 2026 | 2027 | dopo").
- COUNT_VOLUME: numero di eventi/volume entro una data. Sport, economia (es. "Quanti gol farà X in Serie A? 0-15 | 16-20 | 21+").
- RANKING: posizione in classifica. Campionati, classifiche (es. "Posizione Ferrari in F1 2026: 1° | 2° | 3° | 4°+").`;

const SYSTEM_PROMPT = `Sei un esperto di mercati di previsione. Il tuo compito è:
1) Decidere il TIPO DI MERCATO più adatto alla notizia/claim in base all'argomento e alla categoria.
2) Scrivere un TITOLO (domanda) per il mercato in italiano. Massimo 110 caratteri.

${MARKET_TYPES_DESC}

STRUTTURA OBBLIGATORIA DEL TITOLO
Ogni domanda deve contenere: SOGGETTO (chi/cosa), AZIONE (cosa si prevede), SCADENZA (entro quando). La domanda deve terminare con "?".
Regole: lingua italiana, stile Polymarket; niente prefissi tecnici.

PREFERENZA PER MULTI-OPZIONE (non usare sempre BINARY)
- "Chi vincerà / chi sarà / quale squadra / quale candidato" → MULTIPLE_CHOICE (titolo con opzioni es. " : A | B | C" o domanda chiara).
- "Quanto costerà / in che intervallo / prezzo tra" → RANGE o SCALAR (opzioni o valore numerico).
- "Quando accadrà / entro quando / in che anno" → TIME_TO_EVENT (bucket temporali).
- "Quanti gol / quante unità / volume" → COUNT_VOLUME (intervalli numerici).
- "Posizione / classifica / piazzamento" → RANKING.
Usa BINARY o THRESHOLD solo per domande davvero sì/no (es. "Approverà?", "Supererà X?"). Per sport, prezzi, classifiche e "chi/quale/quando/quanti" preferisci il tipo multi-opzione corrispondente.

Rispondi SOLO con un JSON valido: { "market_type": "<uno dei tipi sopra>", "title": "..." }`;

export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

/** Data di oggi per contesto (scadenza plausibile se la notizia non ne ha una). */
function getTodayForPrompt(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function buildUserPrompt(rawTitle: string, category?: string): string {
  const cat = category?.trim();
  const today = getTodayForPrompt();
  const lines = [
    `Notizia/claim: ${rawTitle}`,
    today ? `Data di oggi (per orizzonti temporali): ${today}` : null,
    cat ? `Categoria: ${cat}` : null,
    "",
    "Scegli il market_type più adatto e genera il titolo (soggetto + azione + scadenza). Output JSON (market_type, title):",
  ].filter(Boolean);
  return lines.join("\n");
}
