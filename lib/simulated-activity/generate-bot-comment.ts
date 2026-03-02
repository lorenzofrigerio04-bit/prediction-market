/**
 * Genera un commento personale da bot per un post su un evento.
 * L'AI produce una considerazione breve con inizio e fine logici (non un papiro),
 * per stimolare interazione nei commenti.
 */

import type { PersonaId } from "./bot-personas";

const MAX_LENGTH = 200;

/** Tronca al confine dell'ultima parola completa, mai a metà parola. */
function truncateAtWordBoundary(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace <= 0) return slice;
  return slice.slice(0, lastSpace).trim();
}

export interface EventForComment {
  title: string;
  category: string;
  description?: string | null;
}

const PERSONA_INSTRUCTIONS: Record<PersonaId, string> = {
  finanza:
    "Scrivi come una persona che segue mercati e economia: linguaggio preciso, dati, possibili implicazioni. Prendi una posizione chiara (es. ottimista, cauto, scettico) e motivarla in una frase.",
  sport:
    "Scrivi come un appassionato di sport: tono leggero, può essere scherzoso o tifoso. Prendi una posizione (es. scommetto su X, secondo me va così) e motivarla in modo spontaneo.",
  tech:
    "Scrivi come qualcuno che segue tecnologia e trend: curioso, concreto. Prendi una posizione (es. è il momento, da vedere, sopravvalutato) e argomenta in una frase.",
  politica:
    "Scrivi come qualcuno che segue la politica: tono analitico, possibili conseguenze. Prendi una posizione chiara e argomenta in modo sintetico.",
  generico:
    "Scrivi come una persona informata che legge la notizia: tono naturale, può essere serio o ironico. Prendi una posizione (d’accordo, scettico, incuriosito) e motivarla in una frase.",
};

/**
 * Genera un commento personale coerente con l'evento: l'AI capisce il contesto,
 * prende una posizione e la argomenta. Opzionale persona per variare lo stile.
 * Restituisce null se API assente o errore (il chiamante userà fallback template).
 */
export async function generateEventPostComment(
  event: EventForComment,
  personaId?: PersonaId
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const title = (event.title ?? "").trim();
  const category = (event.category ?? "").trim();
  const description = (event.description ?? "").trim().slice(0, 500);
  const personaInstruction = personaId
    ? PERSONA_INSTRUCTIONS[personaId]
    : PERSONA_INSTRUCTIONS.generico;

  const prompt = `Sei un utente che pubblica un breve commento personale su un evento/notizia in un feed stile social.

EVENTO:
- Titolo: ${title}
- Categoria: ${category}
${description ? `- Descrizione: ${description}` : ""}

REGOLE OBBLIGATORIE:
- ${personaInstruction}
- Una sola considerazione breve: 1 o 2 frasi al massimo. Non un papiro.
- Il commento deve avere inizio e fine logici: concludi sempre con una frase completa (punto fermo). Mai troncare a metà parola o a metà frase.
- Coerente con l'evento: dimostra di aver capito di cosa si parla. Prendi una posizione (es. d'accordo, scettico, preoccupato) e motivarla in poche parole.
- Obiettivo: stimolare risposte e discussione nei commenti.
- Scrivi in italiano. Niente virgolette, hashtag o prefissi tipo "Commento:".
- Lunghezza: massimo ${MAX_LENGTH} caratteri. Rispetta il limite e termina sempre con una frase completa.`;

  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.GENERATION_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 120,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    const cleaned = raw.replace(/^["']|["']$/g, "").replace(/^(Commento|Risposta):\s*/i, "").trim();
    const text =
      cleaned.length > MAX_LENGTH ? truncateAtWordBoundary(cleaned, MAX_LENGTH) : cleaned;
    return text.length > 0 ? text : null;
  } catch (err) {
    console.warn("[generateEventPostComment]", err);
    return null;
  }
}
