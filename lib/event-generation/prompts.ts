/**
 * Prompt di sistema e template user per la generazione eventi (Fase 3).
 * Regole: titolo come domanda SÌ/NO, categorie ammesse, criteri di risolvibilità, output JSON.
 */

import { ALLOWED_CATEGORIES } from "./types";

const CATEGORIES_LIST = ALLOWED_CATEGORIES.join(", ");

export const SYSTEM_PROMPT = `Sei un assistente che trasforma notizie in eventi per un prediction market (mercato di previsioni).

REGOLE OBBLIGATORIE:
1. Titolo: deve essere una domanda con risposta SÌ o NO. Esempio: "Il Parlamento europeo approverà la direttiva sul salario minimo entro il 2025?"
2. Categorie ammesse (usa solo una di queste): ${CATEGORIES_LIST}.
3. Risolvibilità: l'evento deve avere esito binario verificabile, una fonte ufficiale plausibile per la risoluzione, e una scadenza plausibile (closesAt nel futuro, in formato ISO 8601).
4. resolutionSourceUrl: deve essere l'URL della notizia/fonte fornita (stesso URL della notizia di input), che servirà come riferimento per risolvere l'evento.
5. resolutionNotes: breve spiegazione (1-2 frasi) su come si risolverà l'evento usando quella fonte (es. "La risoluzione si baserà sul comunicato ufficiale o sulla notizia ANSA linkata.").

OUTPUT: rispondi SOLO con un oggetto JSON valido, senza markdown o testo aggiuntivo. Formato:
{
  "events": [
    {
      "title": "Domanda SÌ/NO?",
      "description": "Descrizione opzionale dell'evento.",
      "category": "Una delle categorie ammesse",
      "closesAt": "YYYY-MM-DDTHH:mm:ss.000Z",
      "resolutionSourceUrl": "https://...",
      "resolutionNotes": "Come si risolverà l'evento."
    }
  ]
}

Se dalla notizia si può ricavare un solo evento, restituisci un array con un solo elemento. Non inventare dati: usa titolo/snippet/URL forniti.`;

/**
 * Costruisce il messaggio user con titolo, snippet, URL e richiesta esplicita di resolutionSourceUrl e resolutionNotes.
 */
export function buildUserPrompt(candidate: {
  title: string;
  snippet: string;
  url: string;
  sourceName?: string;
}): string {
  return `Trasforma questa notizia in un evento per il prediction market.

Titolo notizia: ${candidate.title}
Snippet: ${candidate.snippet}
URL: ${candidate.url}
${candidate.sourceName ? `Fonte: ${candidate.sourceName}` : ""}

Restituisci un JSON con un oggetto "events" contenente uno (o al massimo uno) evento, con:
- title: domanda SÌ/NO basata sulla notizia
- description: breve descrizione (opzionale)
- category: una tra ${CATEGORIES_LIST}
- closesAt: data/ora di chiusura in futuro (ISO 8601)
- resolutionSourceUrl: l'URL di questa notizia (${candidate.url}) come fonte di risoluzione
- resolutionNotes: note su come si risolverà l'evento usando questo URL`;
}
