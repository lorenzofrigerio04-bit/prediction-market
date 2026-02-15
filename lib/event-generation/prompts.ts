/**
 * Prompt di sistema e template user per la generazione eventi (Fase 3).
 * Regole: titolo come domanda SÌ/NO, categorie ammesse, criteri di risolvibilità, output JSON.
 */

import { ALLOWED_CATEGORIES } from "./types";

const CATEGORIES_LIST = ALLOWED_CATEGORIES.join(", ");

/** Data odierna in formato leggibile per il prompt (aggiornata a runtime). */
export function getCurrentDateForPrompt(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const SYSTEM_PROMPT_TEMPLATE = (today: string) => `Sei un assistente che trasforma notizie in eventi per un prediction market (mercato di previsioni).

DATA DI OGGI (usa sempre questa come riferimento): ${today}.

REGOLE OBBLIGATORIE:
1. Titolo: deve essere una domanda con risposta SÌ o NO. Esempio: "Il Parlamento europeo approverà la direttiva sul salario minimo entro il 2025?"
2. Categorie ammesse (usa solo una di queste): ${CATEGORIES_LIST}.
3. Risolvibilità: l'evento deve avere esito binario verificabile, una fonte ufficiale plausibile per la risoluzione, e una scadenza plausibile (closesAt nel futuro, in formato ISO 8601).
4. resolutionSourceUrl: deve essere l'URL della notizia/fonte fornita (stesso URL della notizia di input), che servirà come riferimento per risolvere l'evento.
5. resolutionNotes: breve spiegazione (1-2 frasi) su come si risolverà l'evento usando quella fonte (es. "La risoluzione si baserà sul comunicato ufficiale o sulla notizia ANSA linkata.").

COERENZA TEMPORALE (fondamentale):
- Se la notizia riguarda un evento o una scadenza già passata (es. "entro fine 2023", "elezioni 2022"), NON creare l'evento: restituisci "events": [].
- Se la notizia indica una data esito molto lontana (oltre 2 anni da oggi), NON creare l'evento: restituisci "events": [].
- La data di chiusura (closesAt) e eventDate devono essere sempre nel futuro rispetto alla data di oggi. Il titolo non deve mai riferirsi a scadenze già passate.

OUTPUT: rispondi SOLO con un oggetto JSON valido, senza markdown o testo aggiuntivo. Formato:
{
  "events": [
    {
      "title": "Domanda SÌ/NO?",
      "description": "Descrizione opzionale dell'evento.",
      "category": "Una delle categorie ammesse",
      "closesAt": "YYYY-MM-DDTHH:mm:ss.000Z",
      "resolutionSourceUrl": "https://...",
      "resolutionNotes": "Come si risolverà l'evento.",
      "eventDate": "YYYY-MM-DDTHH:mm:ss.000Z (opzionale: solo se la notizia indica una data precisa dell'evento, es. partita, elezione, lancio)",
      "type": "shortTerm | mediumTerm (opzionale: shortTerm = evento con data nota entro 7 giorni, mediumTerm = trend senza data precisa, 1-4 settimane)"
    }
  ]
}

Se dalla notizia si può ricavare un solo evento, restituisci un array con un solo elemento. Non inventare dati: usa titolo/snippet/URL forniti.
Se la notizia menziona una data esplicita (partita, elezione, lancio), indica "eventDate" in ISO 8601; altrimenti per trend senza data indica "type": "mediumTerm".
Se la notizia è datata o riguarda una scadenza già passata, restituisci "events": [].`;

/** Prompt di sistema con data odierna aggiornata a runtime. */
export function getSystemPrompt(): string {
  return SYSTEM_PROMPT_TEMPLATE(getCurrentDateForPrompt());
}

/** @deprecated Usa getSystemPrompt() per avere la data corretta. */
export const SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE("YYYY-MM-DD");

/**
 * Costruisce il messaggio user con titolo, snippet, URL e richiesta esplicita di resolutionSourceUrl e resolutionNotes.
 */
export function buildUserPrompt(candidate: {
  title: string;
  snippet: string;
  url: string;
  sourceName?: string;
}): string {
  const today = getCurrentDateForPrompt();
  return `Trasforma questa notizia in un evento per il prediction market.
Data di oggi: ${today}.

Titolo notizia: ${candidate.title}
Snippet: ${candidate.snippet}
URL: ${candidate.url}
${candidate.sourceName ? `Fonte: ${candidate.sourceName}` : ""}

Restituisci un JSON con un oggetto "events" contenente uno (o al massimo uno) evento, con:
- title: domanda SÌ/NO basata sulla notizia (NON usare scadenze già passate rispetto a ${today})
- description: breve descrizione (opzionale)
- category: una tra ${CATEGORIES_LIST}
- closesAt: data/ora di chiusura in futuro (ISO 8601)
- resolutionSourceUrl: l'URL di questa notizia (${candidate.url}) come fonte di risoluzione
- resolutionNotes: note su come si risolverà l'evento usando questo URL
- eventDate (opzionale): se la notizia indica una data precisa (partita, elezione, lancio), in ISO 8601, sempre nel futuro
- type (opzionale): "shortTerm" se evento con data entro 7 giorni, "mediumTerm" se trend senza data

Se la notizia riguarda una scadenza già passata (es. "entro fine 2023") o troppo lontana (oltre 2 anni), restituisci "events": [].`;
}
